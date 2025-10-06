
"use client";

import Link from "next/link";

export function CashfreeMonthlyButton() {
  return (
    <>
      <style>
        {`
          .button-container {
            border: 1px solid black;
            border-radius: 15px;
            display: flex;
            padding: 10px;
            width: fit-content;
            cursor: pointer;
            background: #FFFFFF;
            margin: 0 auto;
          }
          .text-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-left: 10px;
            justify-content: center;
            margin-right: 10px;
          }
          .logo-container {
            width: 40px;
            height: 40px;
          }
          .seconday-logo-container {
            width: 16px;
            height: 16px;
            vertical-align: middle;
          }
          a.cf-link {
            text-decoration: none;
          }
        `}
      </style>
      <Link href="https://payments.cashfree.com/forms/monthly-plan" passHref legacyBehavior>
        <a target="_parent" className="cf-link">
          <div className="button-container">
            <div>
              <img src="https://cashfree-checkoutcartimages-prod.cashfree.com/tabu-logo-websitea98afucsrumg_prod.png" alt="logo" className="logo-container" />
            </div>
            <div className="text-container">
              <div style={{ fontFamily: 'Arial', color: '#000000', marginBottom: '5px', fontSize: '14px' }}>
                Choose Monthly
              </div>
              <div style={{ fontFamily: 'Arial', color: '#000000', fontSize: '10px' }}>
                <span>Powered By Cashfree</span>
                <img src="https://cashfreelogo.cashfree.com/cashfreepayments/logosvgs/Group_4355.svg" alt="logo" className="seconday-logo-container" />
              </div>
            </div>
          </div>
        </a>
      </Link>
    </>
  );
}
