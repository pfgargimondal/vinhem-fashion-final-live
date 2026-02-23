import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import "./Css/Invoice-new.css";
import "./Css/InvoiceResponsive.css";

const Invoice = () => {
  const location = useLocation();
  const invoiceRef = useRef();
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  // ✅ Load data from location or localStorage
  const storedData = JSON.parse(localStorage.getItem("invoiceData")) || {};
  const {
    order = storedData.order,
    // eslint-disable-next-line
    user = storedData.user,
    userOrderProduct = storedData.userOrderProduct,
    getProductDetails = storedData.getProductDetails,
    getGSTDetails = storedData.getGSTDetails,
    pdfView = storedData.pdfView,
  } = location.state || {};

  // ✅ Function to generate + preview PDF automatically
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

  // ✅ Trigger auto-preview only once when pdfView is true
  // useEffect(() => {
  //   if (pdfView) {
  //     // delay a bit to ensure content fully rendered
  //     const timer = setTimeout(() => {
  //       setReady(true);
  //     }, 500);
  //     return () => clearTimeout(timer);
  //   }
  // }, [pdfView]);

  useEffect(() => {
    if (pdfView && ready) {
      previewPDF();
    }
  }, [pdfView, ready, previewPDF]);

  return (
    <>
      {/* <div ref={invoiceRef} id="invoice-content" className=""> */}
      
      <div className="invoice" ref={invoiceRef}>
        {/* HEADER */}
        <table className="header-table">
          <tbody>
            <tr>
              <td className="logo-cell">
                <img src="./images/logo.png" alt="VinHem Fashion" />
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
                <b>Transaction ID : 895520568974</b>
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
                <strong>Invoice No :</strong> VF-2526-001<br />
                <strong>Dated :</strong> Monday, Mar 18, 2025<br />
                <strong>Payment Terms :</strong> Prepaid / COD<br />
                <strong>Currency :</strong> USD / INR<br />
                <strong>Place of Supply :</strong> Australia<br />
                <strong>Country Code :</strong> 29
              </td>

              <td className="col-right" style={{ width: "25%",borderRight: 0, borderTop: 0, paddingTop: 0, transform: "translateY(-5px)" }}>
                <strong>Customer Code :</strong> VF-588969<br />
                <strong>Order No :</strong> VF-2526-590031<br />
                <strong style={{ textDecoration: "underline" }}>Shipment Details :</strong><br />
                <strong>Country :</strong> United States<br />
                <strong>Shipped By :</strong> FEDEX<br />
                <strong>AWB Number :</strong> 1980075826589
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
                <strong>Name :</strong> Hemant Bhatter<br /><br />
                <strong>Address :</strong> 39 RAJGIR CHAMBERS 4TH FLOOR OPP OLD<br />
                CUSTOMS HOUSE S.B.S. ROAD FORT MUMBAI 23<br /><br />
                <strong>GSTIN :</strong> 27AAACO7149M1ZZ
              </td>

              <td style={{ borderRight: 0 }}>
                <strong>Name :</strong> Hemant Bhatter<br /><br />
                <strong>Address :</strong> 39 RAJGIR CHAMBERS 4TH FLOOR OPP OLD<br />
                CUSTOMS HOUSE S.B.S. ROAD FORT MUMBAI 23<br /><br />
                <strong>GSTIN :</strong> 27AAACO7149M1ZZ
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

            <tr>
              <td style={{ borderLeft: 0 }}>1</td>
              <td style={{ textAlign: "left" }}>
                RANAK Purple Resham Embroidery Art Silk Kurta Pajama
              </td>
              <td>60052378</td>
              <td>XXS - 32</td>
              <td>1</td>
              <td>950</td>
              <td>2.5%</td>
              <td>25</td>
              <td>2.5%</td>
              <td>25</td>
              <td>5%</td>
              <td>50</td>
              <td style={{ borderRight: 0 }}>1000</td>
            </tr>

            <tr>
              <td style={{ borderLeft: 0 }}>2</td>
              <td style={{ textAlign: "left" }}>
                RANAK Purple Resham Embroidery Art Silk Kurta Pajama
              </td>
              <td>60052378</td>
              <td>XXS - 32</td>
              <td>1</td>
              <td>950</td>
              <td>2.5%</td>
              <td>25</td>
              <td>2.5%</td>
              <td>25</td>
              <td>5%</td>
              <td>50</td>
              <td style={{ borderRight: 0 }}>1000</td>
            </tr>

            <tr>
              <td style={{ borderLeft: 0 }}>3</td>
              <td style={{ textAlign: "left" }}>
                RANAK Purple Resham Embroidery Art Silk Kurta Pajama
              </td>
              <td>60052378</td>
              <td>XXS - 32</td>
              <td>1</td>
              <td style={{ borderBottom: 0 }}>950</td>
              <td style={{ borderBottom: 0 }}>2.5%</td>
              <td style={{ borderBottom: 0 }}>25</td>
              <td style={{ borderBottom: 0 }}>2.5%</td>
              <td style={{ borderBottom: 0 }}>25</td>
              <td style={{ borderBottom: 0 }}>5%</td>
              <td style={{ borderBottom: 0 }}>50</td>
              <td style={{ borderRight: 0, borderBottom: 0 }}>1000</td>
            </tr>

            <tr>
              <td colspan="4" className="right" style={{ borderLeft: 0 }}><strong>Total Qty</strong></td>
              <td>2</td>
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
              <td>1639</td>
              <td>9%</td>
              <td>179.91</td>
              <td>9%</td>
              <td>179.91</td>
              <td>18%</td>
              <td>359.82</td>
              <td style={{ borderRight: 0 }}>1999</td>
            </tr>

            <tr>
              <td colspan="8" className="words gdfgdf" style={{ borderLeft: 0, borderBottom: 0 }}>
                <strong>Amount In Words :</strong>
                &nbsp; Five Thousand Two Hundred Fourty Nine Only.
              </td>
              <td colspan="4" style={{ borderBottom: 0 }} className="invoice-total-label invoice-total-label-color">
                <strong style={{ fontSize: "1rem" }}>Invoice Total</strong>
              </td>
              <td class="invoice-total" style={{ borderRight: 0, fontSize: "1rem", borderBottom: 0 }}>5249</td>
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
                VinHem Fashion Pvt Ltd
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