
const $ = id => document.getElementById(id);

let tipPercent = 10;
let names = ["Alex", "Jamie", "Sam"];
let currency = "₱";

function money(value) {
    return currency + Number(value || 0).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function renderPeople() {
    $("peopleCount").textContent = names.length;
    $("peopleList").innerHTML = "";

    names.forEach((name, index) => {
        const row = document.createElement("div");
        row.className = "person";

        const avatar = document.createElement("div");
        avatar.className = "avatar";
        avatar.textContent =
            (name.trim()[0] || String(index + 1)).toUpperCase();

        const input = document.createElement("input");
        input.value = name;
        input.setAttribute("aria-label", `Person ${index + 1} name`);

        input.addEventListener("input", () => {
            names[index] = input.value;
            avatar.textContent =
                (input.value.trim()[0] || String(index + 1)).toUpperCase();
            calculate();
        });

        row.append(avatar, input);
        $("peopleList").append(row);
    });

    calculate();
}

function calculate() {
    const bill = Math.max(0, Number($("bill").value) || 0);
    const tip = bill * tipPercent / 100;
    const total = bill + tip;

    const count = names.length;
    const share = count ? total / count : 0;

    $("grandTotal").textContent = money(total);
    $("eachPays").textContent = money(share);
    $("billOut").textContent = money(bill);
    $("tipOut").textContent = tipPercent;
    $("tipAmount").textContent = money(tip);
    $("peopleOut").textContent = count;

    $("sharesCount").textContent =
        `${count} ${count === 1 ? "person" : "people"}`;

    $("shares").innerHTML = "";

    names.forEach((name, index) => {
        const row = document.createElement("div");
        row.className = "share-row";

        const label = document.createElement("span");
        label.textContent = name.trim() || `Person ${index + 1}`;

        const amount = document.createElement("strong");
        amount.textContent = money(share);

        row.append(label, amount);
        $("shares").append(row);
    });
}

// Preset tips
document.querySelectorAll(".tip-btn").forEach(button => {
    button.addEventListener("click", () => {
        tipPercent = Number(button.dataset.tip);

        $("customTip").value = "";

        document.querySelectorAll(".tip-btn").forEach(btn => {
            btn.classList.toggle("active", btn === button);
        });

        $("tipValue").textContent = tipPercent + "%";
        calculate();
    });
});

// Custom tip
$("customTip").addEventListener("input", () => {
    tipPercent = Math.min(
        100,
        Math.max(0, Number($("customTip").value) || 0)
    );

    document.querySelectorAll(".tip-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    $("tipValue").textContent = tipPercent + "%";
    calculate();
});

// Bill amount
$("bill").addEventListener("input", calculate);

// Currency selection
$("currency").addEventListener("change", event => {
    currency = event.target.value;
    $("currencySymbol").textContent = currency;
    calculate();
});

// Add person
$("plus").addEventListener("click", () => {
    if (names.length < 20) {
        names.push(`Friend ${names.length + 1}`);
        renderPeople();
    }
});

// Remove person
$("minus").addEventListener("click", () => {
    if (names.length > 1) {
        names.pop();
        renderPeople();
    }
});

// Reset calculator
$("resetBtn").addEventListener("click", () => {
    $("bill").value = 0;
    tipPercent = 0;
    names = ["Alex", "Jamie", "Sam"];

    $("customTip").value = "";
    $("tipValue").textContent = "0%";

    document.querySelectorAll(".tip-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.tip === "0");
    });

    renderPeople();
});

// Copy summary
$("copyBtn").addEventListener("click", async () => {
    const bill = Math.max(0, Number($("bill").value) || 0);
    const tip = bill * tipPercent / 100;
    const total = bill + tip;
    const share = total / names.length;

    const summary = [
        "SplitEase Bill Summary",
        `Bill: ${money(bill)}`,
        `Tip: ${tipPercent}% (${money(tip)})`,
        `Total: ${money(total)}`,
        "",
        "Individual Shares:",
        ...names.map((name, index) =>
            `${name.trim() || `Person ${index + 1}`}: ${money(share)}`
        )
    ].join("\n");

    try {
        await navigator.clipboard.writeText(summary);

        $("toast").textContent = "Summary copied!";
    } catch {
        $("toast").textContent = "Copy isn't available in this browser.";
    }

    $("toast").classList.add("show");

    setTimeout(() => {
        $("toast").classList.remove("show");
    }, 2000);
});

// Initial rendering
renderPeople();
