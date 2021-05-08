const cmd = document.getElementById("edit");
const before = document.getElementById("before");
const caret = document.getElementById("caret");
const after = document.getElementById("after");
const root = document.querySelector(":root");
const title = document.querySelector("title");
const gcol = document.getElementById("getColor");
const startTitle = title.innerText;
const version = "beta 3.0";
let chrono = [""];
let chrono_pos = 0;

const firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

function toRGB(v) {
    gcol.style.color = v;

    const RGB = window.getComputedStyle(gcol).color.split("(")[1].split(")")[0].split(", ");
    return {
        R: parseInt(RGB[0] ?? "0"),
        G: parseInt(RGB[1] ?? "0"),
        B: parseInt(RGB[2] ?? "0"),
    };
}

function getCoord() {
    return { x: before.innerText.split("\n").slice(-1)[0].length, y: before.innerText.split("\n").length -1 };
}

function setCoord(x, y) {
    let lines = cmd.innerText.split("\n");

    for(let i = lines.length; i <= y; i++)
        lines.push("");

    lines[y] = lines[y].padEnd(x, ' ');

    before.innerHTML = lines.slice(0, y).join("\n") + (y > 0? "\n" : "") + lines[y].substr(0, x);
    let ln = lines.slice(y + 1).join("\n");
    after.innerHTML = lines[y].substr(x) + ln;
}

function printf(v) {
    v = v ?? "";
    v = v.toString();

    let af = after.innerText;

    before.innerText = before.innerText + v;
    after.innerText = af.substr(v.length);
    //after.text(af.split("\n")[0].substr(v.length) + "\n" + af.split("\n").slice(1).join("\n"));
    setScrollToCaret();
}

function println(x) {
    printf((x ?? "") + "\n");
}

function line() {
    printf("\n");
}

function setColor(bg, fg) {
    bg = toRGB(bg);
    fg = toRGB(fg);

    root.style.setProperty("--bg-r", bg.R.toString());
    root.style.setProperty("--bg-g", bg.G.toString());
    root.style.setProperty("--bg-b", bg.B.toString());
    root.style.setProperty("--clr-r", fg.R.toString());
    root.style.setProperty("--clr-g", fg.G.toString());
    root.style.setProperty("--clr-b", fg.B.toString());
}

function resetColor() {
    root.style.setProperty("--bg-r", "");
    root.style.setProperty("--bg-g", "");
    root.style.setProperty("--bg-b", "");
    root.style.setProperty("--clr-r", "");
    root.style.setProperty("--clr-g", "");
    root.style.setProperty("--clr-b", "");
}

function setScrollToCaret() {
    if(caret.getBoundingClientRect().top - 10 < 0)
        window.scrollTo(window.scrollX, window.scrollY + caret.getBoundingClientRect().top);
    if(caret.getBoundingClientRect().top + 10 > document.documentElement.clientHeight)
        window.scrollTo(window.scrollX, window.scrollY + caret.getBoundingClientRect().top - document.documentElement.clientHeight + caret.getBoundingClientRect().height);
}

function getch() {
    return new Promise(resolve => {
        caret.classList.add("c-show");
        cmd.addEventListener('keydown', onKeyD);

        function onKeyD(e) {
            e.preventDefault();

            if(e.key !== "Shift" && e.key !== "Control" && e.key !== "Alt")
                setScrollToCaret();

            if(e.key.length === 1) {
                cmd.removeEventListener('keydown', onKeyD);
                caret.classList.remove("c-show");
                caret.classList.add("typing");

                setTimeout(function () {
                    caret.classList.remove("typing");
                }, 10);
            }

            resolve(e);
        }
    });
}

let buffer = [ ];

async function input(pr) {
    if(pr !== undefined)
        printf(pr);

    let crd = { x: getCoord().x, y: getCoord().y };

    let str = "";
    let bfr = "", aft = "", aaft = "";
    let maxL = 0;
    let pos = 0, oldPos = 0;
    let jmp = false;
    let bkBfrLn = before.innerText.length;

    if(buffer.length >= 0) {
        bfr = buffer.shift() ?? "";
        keyP();
        if(buffer.length > 0)
            jmp = true;
    }

    while(!jmp) {
        let c = await getch();

        if (c.ctrlKey && c.key === "Backspace") {
            bfr = bfr.substr(0, bfr.lastIndexOf(" "));
        } else if (c.key === "Backspace") {
            bfr = bfr.substr(0, bfr.length - 1);
        } else if (c.key === "Delete") {
            aft = aft.substr(1);
        } else if(c.key === "Enter") {
            break;
        } else if(c.key === "ArrowUp") {
            chrono_pos--;

            if(chrono_pos < 0)
                chrono_pos = 0;
            if(chrono_pos > chrono.length - 1)
                chrono_pos = chrono.length - 1;

            bfr = chrono[chrono_pos];
            aft = "";
        } else if(c.key === "ArrowDown") {
            chrono_pos++;

            if(chrono_pos < 0)
                chrono_pos = 0;
            if(chrono_pos > chrono.length - 1)
                chrono_pos = chrono.length - 1;

            bfr = chrono[chrono_pos];
            aft = "";
        } else if(c.ctrlKey && c.key === "ArrowLeft") {
            let p = bfr.lastIndexOf(" ");

            p = p !== -1? p : 0;

            aft = bfr.substr(p) + aft;
            bfr = bfr.substr(0, p);
        } else if(c.ctrlKey && c.key === "ArrowRight") {
            let p = aft.indexOf(" ");

            p = p !== -1? p : aft.length - 1;

            bfr += aft.substr(0, p + 1);
            aft = aft.substr(p + 1);
        } else if(c.key === "ArrowLeft") {
            aft = bfr.charAt(bfr.length - 1) + aft;
            bfr = bfr.slice(0, -1);
        } else if(c.key === "ArrowRight") {
            bfr += aft.charAt(0);
            aft = aft.substr(1);
        } else if(c.ctrlKey && c.code === "KeyV" && !firefox) {
            if(window.getSelection().toString() !== "")
                window.getSelection().removeAllRanges();

            let r = await navigator.clipboard.readText();
            if(r !== "") {
                let spl = r.split("\n");
                let v = spl.shift();

                bfr += v;
                before.innerText += v;
                buffer = [...spl, ...buffer];

                if(spl.length > 0) {
                    keyP();
                    break;
                }
            }
        } else if(c.ctrlKey && c.code === "KeyC" && !firefox) {

        } else if (c.ctrlKey && !c.altKey) {
            if(c.key.length === 1 && c.key.match(/[a-zA-Z]/)) {
                bfr += "^" + c.key.toUpperCase();
            }
        } else if(c.key.length === 1) {
            bfr += c.key;
        }

        if(c.key !== "Shift" && c.key !== "Control" && c.key !== "Alt") {
            keyP();
            document.getSelection().removeAllRanges();
        }
    }

    function keyP() {
        pos = bfr.length;
        str = bfr + aft;

        maxL = Math.max(maxL, str.length);

        aaft = str.padEnd(maxL, " ").substr(bfr.length);

        before.innerText = before.innerText.substr(0, bkBfrLn) + bfr;
        after.innerText = aaft + after.innerText.substr(aaft.length + (pos - oldPos));
        oldPos = pos;
    }

    before.innerText = before.innerText.substr(0, bkBfrLn) + str + "\n";
    after.innerText = after.innerText.substr(aaft.length);

    chrono_pos = chrono.length + 1;

    return str;
}

function setTitle(v) {
    let ttl = v == ""? startTitle : v;

    title.innerText = ttl;
}

function getBlinkSpeed() {
    return parseInt(root.style.getPropertyValue("--caret-bs"));
}

function setBlinkSpeed(v) {
    return root.style.setProperty("--caret-bs", parseInt(v).toString());
}

function getCursorSize() {
    return {w: parseInt(root.style.getPropertyValue("--caretW")), h: parseInt(root.style.getPropertyValue("--caretH"))};
}

function setCursorSize(w, h) {
    root.style.setProperty("--caretW", Math.min(8, Math.max(w, 0)).toString());
    root.style.setProperty("--caretH", Math.min(8, Math.max(h, 0)).toString());
}

function getTitle() {
    return title.innerText;
}

cmd.addEventListener("contextmenu", function (e) {
    e.preventDefault();
});

cmd.addEventListener("keydown", (e) => {
    if(e.ctrlKey && e.code === "KeyC" && !firefox) {
        if(window.getSelection().toString() !== "")
            navigator.clipboard.writeText(window.getSelection().toString()).then();
    }
});