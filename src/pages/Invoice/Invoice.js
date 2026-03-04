import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./Css/Invoice-new.css";
import "./Css/InvoiceResponsive.css";
import http from "../../http";
import Loader from "../../components/Loader/Loader";
import { useAuth } from "../../context/AuthContext";
import { ToWords } from 'to-words';

const Invoice = () => {
    const { orderId } = useParams();
    const { token } = useAuth();
    const invoiceRef = useRef(null);
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    // eslint-disable-next-line
    const [user, setUser] = useState(null);
    // eslint-disable-next-line
    const [userOrderProduct, setUserOrderProduct] = useState([]);
    // eslint-disable-next-line
    const [getProductDetails, setGetProductDetails] = useState([]);
    // eslint-disable-next-line
    const [getGSTDetails, setGetGSTDetails] = useState(null);
    const [getCurrenyCode, setGetCurrenyCode] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchInvoiceData = useCallback(async () => {
      try {
        const res = await http.get("/user/get-invoice-details", {
          headers: { Authorization: `Bearer ${token}` },
          params: { id: orderId },
        });

        const data = res.data.data;

        setOrder(data.orders);
        setUser(data.user);
        setUserOrderProduct(data.user_order_product_details);
        setGetProductDetails(data.get_product_details);
        setGetGSTDetails(data.get_gst_value);
        setGetCurrenyCode(data.get_currency_code);
        setLoading(false);

        // setTimeout(() => {
        //   previewPDF();
        // }, 800);

      } catch (error) {
        console.error("Invoice fetch failed:", error);
      }
    }, [orderId, token]); // ✅ dependencies added here

    console.log(userOrderProduct, 'userOrderProduct');

    useEffect(() => {
      if (!token) return;
      fetchInvoiceData();
    }, [fetchInvoiceData, token]); // ✅ no warning now


    const previewPDF = useCallback(async () => {
      if (!invoiceRef.current) return;

      // Show temporarily to capture
      invoiceRef.current.style.display = "block";

      const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
      // eslint-disable-next-line
      const imgData = canvas.toDataURL("image/png");

      // Hide again
      invoiceRef.current.style.display = "none";

      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Margins
      const marginTop = 15;
      const marginRight = 10;
      const marginBottom = 15;
      const marginLeft = 10;

      const usableWidth = pdfWidth - marginLeft - marginRight;
      // eslint-disable-next-line
      const usableHeight = pdfHeight - marginTop - marginBottom;

      const imageHeight = (canvas.height * usableWidth) / canvas.width;
      let y = marginTop;

      pdf.addImage(canvas, "PNG", marginLeft, y, usableWidth, imageHeight);

    // ✅ Auto preview
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank"); // Opens in new tab
      pdf.save(`invoice-${order?.order_id || "Invoice"}.pdf`);

      // ✅ Redirect to previous page after 1s
      setTimeout(() => {
        navigate(-1); // 🔙 goes back to previous route
      }, 100);
    }, [navigate, order]);

    if (loading) {
        return <Loader />;
    }

// Gst Calculation function here

    const gstCalc = (amount, state) => {
    const net = amount / 1.18;              // taxable value
    const totalGst = amount - net;          // total 18% GST

    let cgst = 0, sgst = 0, igst = 0;
    let cgstRate = 0, sgstRate = 0, igstRate = 0;

    if (state?.toLowerCase().trim() === "west bengal") {
      cgstRate = 9;
      sgstRate = 9;
      cgst = totalGst / 2;
      sgst = totalGst / 2;
    } else {
      igstRate = 18;
      igst = totalGst;
    }

    return {
      net,
      cgst,
      sgst,
      igst,
      cgstRate,
      sgstRate,
      igstRate
    };
  };


  let totalQty = 0;
  userOrderProduct?.forEach((item) => {
    totalQty += Number(item.quantity || 0);

    if (Number(item.turban_selected) === 1) totalQty += 1;
    if (Number(item.mojri_selected) === 1) totalQty += 1;
    if (Number(item.stole_selected) === 1) totalQty += 1;
  });
  const state = order?.shippingState || "";

  const shippingAmount = Number(order?.shipping_charge || 0);
  const shippingGst = gstCalc(shippingAmount, state);

  let totalTaxable = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;
  let totalAmount = 0;

  userOrderProduct?.forEach((item) => {

    // ----- MAIN PRODUCT -----
    const gross =
    Number(item.total_price || 0) +
    Number(item.custom_fit_charge || 0);
    const gst = gstCalc(gross, state);

    totalTaxable += gst.net;
    totalCgst += gst.cgst;
    totalSgst += gst.sgst;
    totalIgst += gst.igst;
    totalAmount += gross;

    // ----- TURBAN -----
    if (Number(item.turban_selected) === 1) {
      const grossAddon = Number(item.turban_charge || 0);
      const gstAddon = gstCalc(grossAddon, state);

      totalTaxable += gstAddon.net;
      totalCgst += gstAddon.cgst;
      totalSgst += gstAddon.sgst;
      totalIgst += gstAddon.igst;
      totalAmount += grossAddon;
    }

    // ----- MOJRI -----
    if (Number(item.mojri_selected) === 1) {
      const grossAddon = Number(item.mojri_charge || 0);
      const gstAddon = gstCalc(grossAddon, state);

      totalTaxable += gstAddon.net;
      totalCgst += gstAddon.cgst;
      totalSgst += gstAddon.sgst;
      totalIgst += gstAddon.igst;
      totalAmount += grossAddon;
    }

    // ----- STOLE -----
    if (Number(item.stole_selected) === 1) {
      const grossAddon = Number(item.stole_charge || 0);
      const gstAddon = gstCalc(grossAddon, state);

      totalTaxable += gstAddon.net;
      totalCgst += gstAddon.cgst;
      totalSgst += gstAddon.sgst;
      totalIgst += gstAddon.igst;
      totalAmount += grossAddon;
    }
  });

  totalTaxable += shippingGst.net;
  totalCgst += shippingGst.cgst;
  totalSgst += shippingGst.sgst;
  totalIgst += shippingGst.igst;
  totalAmount += shippingAmount;


  const toWords = new ToWords({
  localeCode: 'en-IN',
  converterOptions: {
    currency: false,
    ignoreDecimal: true,
    ignoreZeroCurrency: true,
    }
  });

 const amountInWords = toWords.convert(Math.round(totalAmount));
  

  return (
    <>
      {/* <div ref={invoiceRef} id="invoice-content" className=""> */}
      
      <div className="invoice" ref={invoiceRef}>
        {/* HEADER */}
        <table className="header-table">
          <tbody>
            <tr>
              <td className="logo-cell">
                <img src="../images/logo.png" alt="VinHem Fashion" />
              </td>
              <td className="title-cell">
                <div className="invoice-title">RETAIL / TAX INVOICE</div>
                <div className="subtitle">(Original For Recipient)</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* SOLD BY / INVOICE INFO */}
        <table className="info-table">
          <tbody>
            <tr className="address-head">
              <td style={{ borderTop: 0, borderLeft: 0 }} className="invoice-total-label-color">
                <b>SOLD BY :</b>
              </td>
              <td style={{ borderBottom: 0, borderTop: 0, paddingBottom: 0 }}>
                <b>CIN Number : N/A</b>
              </td>
              <td style={{ borderBottom: 0, borderTop: 0, borderRight: 0, paddingBottom: 0 }}>
                <b>Transaction ID : {order?.transaction_id}</b>
              </td>
            </tr>

            <tr>
              <td className="col-left" style={{ borderLeft: 0, width: "50%", paddingTop: 0 }}>
                <strong>Name :</strong> VinHem Fashion<br />
                <strong>Address :</strong> 13, Rameswar Mallick 1st Bye Lane, 3rd Floor,<br />
                Room - 3A, Howrah - 711101<br />
                <strong>Name of State :</strong> West Bengal |
                <strong> State Code :</strong> 29<br />
                <strong>Name of Country :</strong> India<br />
                <strong>GSTIN :</strong> 19AMIPB0423A1ZV |
                <strong> PAN :</strong> AMIPB0423A
              </td>

              <td style={{ width: "25%", borderTop: 0, paddingTop: 0, transform: "translateY(-5px)" }} className="col-middle">
                <strong>Invoice No :</strong> {order?.invoice_no}<br />
                <strong>Dated :</strong> {order?.order_date &&
                  new Date(order.order_date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                }<br />
                <strong>Payment Terms :</strong> {order?.payment_method === 'cash_on_delivery' ? 'COD' : 'Prepaid'}<br />
                <strong>Currency :</strong> {getCurrenyCode?.currency_code ? getCurrenyCode.currency_code : "INR"}<br />
                <strong>Place of Supply :</strong> {order?.shippingCountry ? order.shippingCountry : "-"}<br />
                <strong>Country Code :</strong> {getCurrenyCode?.cuntry_code ? getCurrenyCode.cuntry_code : "-"}
              </td>

              <td className="col-right" style={{ width: "25%",borderRight: 0, borderTop: 0, paddingTop: 0, transform: "translateY(-5px)" }}>
                <strong>Customer Code :</strong> {user?.customer_code}<br />
                <strong>Order No :</strong> {order?.order_id}<br />
                <strong style={{ textDecoration: "underline" }}>Shipment Details :</strong><br />
                <strong>Country :</strong> {order?.shippingCountry}<br />
                <strong>Shipped By :</strong> {order?.shipping_method ? order?.shipping_method : "-"}<br />
                <strong>AWB Number :</strong> {order?.awb_no}
              </td>
            </tr>
          </tbody>
        </table>

        {/* BILLING / SHIPPING */}
        <table className="address-table">
          <tbody>
            <tr className="invoice-total-label-color">
              <td style={{ borderTop: 0, borderLeft: 0 }}>
                <b>Customer (Billing Address)</b>
              </td>
              <td style={{ borderTop: 0, borderRight: 0 }}>
                <b>Customer (Shipping Address)</b>
              </td>
            </tr>

            <tr>
              <td style={{ borderLeft: 0 }}>
                <strong>Name :</strong> {order?.billingName}<br />
                <strong>Address :</strong> {order?.billingFullAddress}<br />
                <strong>GSTIN :</strong> {order?.gst_number ? order.gst_number : "N/A"}
              </td>

              <td style={{ borderRight: 0 }}>
                <strong>Name :</strong> {order?.shippingName}<br />
                <strong>Address :</strong> {order?.shippingFullAddress}<br />
                <strong>GSTIN :</strong> {order?.gst_number ? order.gst_number : "N/A"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* PRODUCT TABLE */}
        <table className="product-table">
          <tbody>
            <tr className="invoice-total-label-color">
              <th style={{borderTop: 0, borderLeft: 0}}>S/N</th>
              <th style={{borderTop: 0}}>Product Description</th>
              <th style={{borderTop: 0}}>HSN Code</th>
              <th style={{borderTop: 0}}>Size</th>
              <th style={{borderTop: 0}}>Qty</th>
              <th style={{borderTop: 0}}>Taxable Value</th>
              <th style={{borderTop: 0}} colSpan="2">CGST</th>
              <th style={{borderTop: 0}} colSpan="2">SGST</th>
              <th style={{borderTop: 0}} colSpan="2">IGST</th>
              <th style={{borderTop: 0, borderRight: 0, borderBottom: 0, transform: "translateY(1rem)"}}>Total Amount</th>
            </tr>

            <tr className="sub-head">
              <th colspan="6" style={{borderLeft: 0}}></th>
              <th>Rate</th>
              <th>Amount</th>
              <th>Rate</th>
              <th>Amount</th>
              <th>Rate</th>
              <th>Amount</th>
              <th style={{borderTop: 0, borderRight: 0}}></th>
            </tr>

                  
            {userOrderProduct?.map((item, index) => {
             const gross =
                          parseFloat(item.total_price || 0) +
                          parseFloat(item.custom_fit_charge || 0);

                        const gst = gstCalc(gross, state);
              let serial = 0;
              return (
                <React.Fragment key={index}>

                  {/* MAIN PRODUCT ROW */}
                  <tr style={{border: "none"}}>
                    <td>{++serial}</td>
                    <td style={{ textAlign: "left" }}>{item.product_name}</td>
                    <td>60052378</td>
                    <td>{item.product_size || '-'}</td>
                    <td>{item.quantity || '-'}</td>
                    <td>{gst.net.toFixed(2)}</td>
                    <td>{gst.cgstRate}%</td>
                    <td>{gst.cgst.toFixed(2)}</td>
                    <td>{gst.sgstRate}%</td>
                    <td>{gst.sgst.toFixed(2)}</td>
                    <td>{gst.igstRate}%</td>
                    <td>{gst.igst.toFixed(2)}</td>
                    <td>{gross.toFixed(2)}</td>
                  </tr>


                  {/* TURBAN */}
                  {item.turban_selected === '1' && (() => {

                    const grossAddon = parseFloat(item.turban_charge || 0);
                    const gstAddon = gstCalc(grossAddon, state);

                    return (
                      <tr>
                        <td>{++serial}</td>
                        <td style={{ textAlign: "left" }}>Matching Turban</td>
                        <td>60052378</td>
                        <td>{item.turban_size || '-'}</td>
                        <td>1</td>
                        <td>{gstAddon.net.toFixed(2)}</td>
                        <td>{gstAddon.cgstRate}%</td>
                        <td>{gstAddon.cgst.toFixed(2)}</td>
                        <td>{gstAddon.sgstRate}%</td>
                        <td>{gstAddon.sgst.toFixed(2)}</td>
                        <td>{gstAddon.igstRate}%</td>
                        <td>{gstAddon.igst.toFixed(2)}</td>
                        <td>{grossAddon.toFixed(2)}</td>
                      </tr>
                    );
                  })()}


                  {/* MOJRI */}
                  {item.mojri_selected === '1' && (() => {

                    const grossAddon = parseFloat(item.mojri_charge || 0);
                    const gstAddon = gstCalc(grossAddon, state);

                    return (
                      <tr>
                        <td>{++serial}</td>
                        <td style={{ textAlign: "left" }}>Matching Mojri</td>
                        <td>60052378</td>
                        <td>{item.mojri_size || '-'}</td>
                        <td>1</td>
                        <td>{gstAddon.net.toFixed(2)}</td>
                        <td>{gstAddon.cgstRate}%</td>
                        <td>{gstAddon.cgst.toFixed(2)}</td>
                        <td>{gstAddon.sgstRate}%</td>
                        <td>{gstAddon.sgst.toFixed(2)}</td>
                        <td>{gstAddon.igstRate}%</td>
                        <td>{gstAddon.igst.toFixed(2)}</td>
                        <td>{grossAddon.toFixed(2)}</td>
                      </tr>
                    );
                  })()}


                  {/* STOLE */}
                  {item.stole_selected === '1' && (() => {

                    const grossAddon = parseFloat(item.stole_charge || 0);
                    const gstAddon = gstCalc(grossAddon, state);

                    return (
                      <tr>
                        <td>{++serial}</td>
                        <td style={{ textAlign: "left" }}>Matching Stole</td>
                        <td>60052378</td>
                        <td>{item.stole_size || '-'}</td>
                        <td>1</td>
                        <td>{gstAddon.net.toFixed(2)}</td>
                        <td>{gstAddon.cgstRate}%</td>
                        <td>{gstAddon.cgst.toFixed(2)}</td>
                        <td>{gstAddon.sgstRate}%</td>
                        <td>{gstAddon.sgst.toFixed(2)}</td>
                        <td>{gstAddon.igstRate}%</td>
                        <td>{gstAddon.igst.toFixed(2)}</td>
                        <td>{grossAddon.toFixed(2)}</td>
                      </tr>
                    );
                  })()}

                </React.Fragment>
              );
            })}

            

            <tr>
              <td colspan="4" className="right" style={{ borderLeft: 0 }}><strong>Total Qty</strong></td>
              <td>{totalQty}</td>
              <td style={{ borderBottom: 0, borderTop: 0 }}></td>
              <td style={{ borderBottom: 0, borderTop: 0 }}></td>
              <td style={{ borderBottom: 0, borderTop: 0 }}></td>
              <td style={{ borderBottom: 0, borderTop: 0 }}></td>
              <td style={{ borderBottom: 0, borderTop: 0 }}></td>
              <td style={{ borderBottom: 0, borderTop: 0 }}></td>
              <td style={{ borderBottom: 0, borderTop: 0 }}></td>
              <td style={{ borderBottom: 0, borderTop: 0, borderRight: 0 }}></td>
            </tr>

            <tr>
              <td colspan="5" style={{ borderLeft: 0 }}><strong>Shipping &amp; Duties</strong></td>
              <td>{totalTaxable.toFixed(2)}</td>
              <td>{shippingGst.cgstRate}%</td>
              <td>{totalCgst.toFixed(2)}</td>
              <td>{shippingGst.sgstRate}%</td>
              <td>{totalSgst.toFixed(2)}</td>
              <td>{shippingGst.igstRate}%</td>
              <td>{totalIgst.toFixed(2)}</td>
              <td style={{ borderRight: 0 }}>{totalAmount.toFixed(2)}</td>
            </tr>

            <tr>
              <td colspan="8" className="words gdfgdf" style={{ borderLeft: 0, borderBottom: 0 }}>
                <strong>Amount In Words :</strong>
                &nbsp; {amountInWords} Only.
              </td>
              <td colspan="4" style={{ borderBottom: 0 }} className="invoice-total-label invoice-total-label-color">
                <strong style={{ fontSize: "1rem" }}>Invoice Total</strong>
              </td>
              <td class="invoice-total" style={{ borderRight: 0, fontSize: "1rem", borderBottom: 0 }}>{totalAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {/* FOOTER */}
        <table className="footer-table">
          <tbody>
            <tr>
              <td style={{ borderLeft: 0, textAlign: "center" }}>
                <strong>Returning your item:</strong><br />
                Go to "Your Account" on Vinhemfashion.com, click <strong>"Orders History"</strong>
                and then click the <strong>"Mark Return"</strong> link for this order to get information about the return and refund policies that apply.
              </td>

              <td style={{ borderRight: 0, fontSize: "1rem", width: "20%" }} className="company-name">
                VinHem Fashion
              </td>
            </tr>

            <tr>
              <td className="website" style={{ borderLeft: 0, borderBottom: 0 }}>
                www.vinhemfashion.com
              </td>

              <td className="signature" style={{ borderRight: 0, borderBottom: 0 }}>
                Authorised Signatory
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* </div> */}

      <button onClick={previewPDF}>Preview PDF</button>

    </>
   
  )
}
export default Invoice;