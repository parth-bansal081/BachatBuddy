export const getMockBankData = () => {
    const transactions = [];
    const now = new Date();
    const narrations = [
        { type: "DEBIT", mode: "UPI", text: "UPI/1234567890/Swiggy/HDFC" },
        { type: "DEBIT", mode: "UPI", text: "UPI/0987654321/Uber/ICICI" },
        { type: "DEBIT", mode: "ATM", text: "ATM WDL/HDFC BANK/BANGALORE" },
        { type: "CREDIT", mode: "NEFT", text: "NEFT-AXIS000123-KIRAN-RENT" },
        { type: "DEBIT", mode: "POS", text: "POS/456789/STARBUCKS" },
        { type: "DEBIT", mode: "UPI", text: "UPI/1122334455/Zomato/SBI" },
        { type: "DEBIT", mode: "NET", text: "NETFLIX.COM SUBSCRIPTION" },
        { type: "DEBIT", mode: "UPI", text: "UPI/AMAZON PAY/SHOPPING" }
    ];

    // Generate ~100 transactions over 6 months, biased towards recent
    const entries = [];
    for (let i = 0; i < 100; i++) {
        // 70% chance of being in the last 30 days
        const isRecent = Math.random() > 0.3;
        const daysAgo = isRecent
            ? Math.floor(Math.random() * 30)
            : Math.floor(Math.random() * 180);
        entries.push({ daysAgo, id: i });
    }
    entries.sort((a, b) => a.daysAgo - b.daysAgo); // Newest first (smallest daysAgo first)

    // Wait, let's verify sort.
    // [180, 10, 1]. sort((a,b)=>b-a) -> [180, 10, 1].
    // 180 days ago is the oldest date. correct.

    let balance = 12500.00; // Starting balance 6 months ago

    const finalTxns = entries.map((entry, idx) => {
        const date = new Date(now.getTime() - entry.daysAgo * 24 * 60 * 60 * 1000);
        // Add random time
        date.setHours(9 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60));

        let type, mode, text, amount;

        // Inject salary every ~15 txns
        if (idx > 0 && idx % 15 === 0) {
            type = "CREDIT";
            mode = "ACH";
            text = "ACH/SALARY/INFOSYS LTD";
            amount = 85000.00;
        } else {
            const template = narrations[Math.floor(Math.random() * narrations.length)];
            type = template.type;
            mode = template.mode;
            text = template.text;

            if (type === "CREDIT") {
                amount = parseFloat((Math.random() * 5000 + 500).toFixed(2));
            } else {
                amount = parseFloat((Math.random() * 3000 + 50).toFixed(2));
            }
        }

        if (type === "CREDIT") {
            balance += amount;
        } else {
            balance -= amount;
        }

        return {
            "txnId": `TXN${now.getTime()}${idx}`,
            "txnDate": date.toISOString(),
            "valueDate": date.toISOString().split('T')[0],
            "mode": mode,
            "amount": amount.toFixed(2),
            "currentBalance": balance.toFixed(2),
            "narration": text,
            "ref": `REF${Math.floor(Math.random() * 999999)}`,
            "type": type
        };
    });

    const oldestDate = finalTxns[0].valueDate;
    const newestDate = finalTxns[finalTxns.length - 1].valueDate;

    return {
        "Account": {
            "Profile": {
                "Holders": {
                    "Holder": {
                        "name": "Arjun Kumar",
                        "dob": "1992-08-15",
                        "mobile": "9876543210",
                        "nominee": "REGISTERED",
                        "email": "arjun.kumar@example.com",
                        "pan": "ABCDE1234F",
                        "ckycCompliance": "true"
                    },
                    "type": "SINGLE"
                }
            },
            "Summary": {
                "currentBalance": balance.toFixed(2),
                "currency": "INR",
                "exchangeRate": "1",
                "balanceDateTime": new Date().toISOString(),
                "type": "SAVINGS",
                "branch": "Koramangala",
                "facility": "OD",
                "ifscCode": "HDFC0001234",
                "micrCode": "560240002",
                "openingDate": "2018-05-20",
                "status": "ACTIVE",
                "accountNumber": "50100987654321"
            },
            "Transactions": {
                "startDate": oldestDate,
                "endDate": newestDate,
                "Transaction": finalTxns.reverse() // Return newest first
            }
        }
    }
}