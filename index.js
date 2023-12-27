import { createRequire } from "module";
const require = createRequire(import.meta.url);
import express from "express";
import fs from "fs";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";
import nodemailer from "nodemailer";
import * as os from "os";
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const EMAIL="kodu@liven.ee"
const REFRESH_TOKEN="1//045a5TvbUtJjqCgYIARAAGAQSNwF-L9Ir2he5XyDHe_GIGo9PWNAjdMAWcNV6EsHhahF93nrO3dyoitX9oBXm9eeBYiBMmxrak08";
const CLIENT_SECRET="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"
const CLIENT_ID="635806718203-qil13sbv9jjmtb06h1s71la4dvrlscfp.apps.googleusercontent.com"

const router = express.Router();
const app = express();
const port = process.env.PORT || 8080;
const jsonParser = bodyParser.json();

app.use(cors());

// add router in express app
app.use("/",router);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const upload = multer({ dest: os.tmpdir() });

const createTransporter = async () => {
    const oauth2Client = new OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
        refresh_token: REFRESH_TOKEN
    });

    const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
            if (err) {
                reject("Failed to create access token :(");
            }
            resolve(token);
        });
    });

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: EMAIL,
            accessToken,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN
        }
    });

    return transporter;
};

router.get('/status',(req, res) => {
    res.sendStatus(200);
});

router.post('/email_attachment', upload.single('file'), async function(req, res) {
    // const file = req.file;
    // console.log(file);

    console.log(req.body);

    // const csvFile = req.body.csvData;

    // fs.writeFileSync("/tmp/customer_selections.csv", csvFile);

    if (req.body.email && req.body.apartment && req.body.homeDesignerUrl) {
        const mailDataEt = {
            from: EMAIL,
            to: req.body.email,
            subject: req.body.apartment,
            text: '',
            // attachments: [
            //     {
            //         filename: req.body.pdfFileName,
            //         path: file.path
            //     }
            // ],
            html: `<p>Tere!</p>
                    <p>Jätka Kodukujundajas viimistlusvalikute tegemist siin: <a rel="noreferrer" target="_blank" href=${req.body.homeDesignerUrl}>${req.body.apartment}</a></p>
                    <p>Valikute mugavaks haldamiseks ja Livenile edastamiseks loo konto.</p>
                    <p>Edu kodu loomisel!</p>
                    <p>Liven</p>
            `,
        };

        const mailDataEn = {
            from: EMAIL,
            to: req.body.email,
            subject: req.body.apartment,
            text: '',
            // attachments: [
            //     {
            //         filename: req.body.pdfFileName,
            //         path: file.path
            //     }
            // ],
            html: `<p>Hello!</p>
                    <p>Continue your interior design selections in Home Designer here: <a rel="noreferrer" target="_blank" href=${req.body.homeDesignerUrl}>${req.body.apartment}</a></p>
                    <p>Create an account to conveniently manage your selections and submit them to Liven.</p>
                    <p>Happy home designing!</p>
                    <p>Liven</p>
            `,
        };

        // email sending to Liven
        // const recordMailData = {
        //     from: EMAIL,
        //     to: "kodukujundaja@liven.ee",
        //     subject: `${req.body.apartment} for ${req.body.email}`,
        //     text: '',
        //     attachments: [
        //         {
        //             filename: req.body.pdfFileName,
        //             path: file.path
        //         },
        //         {
        //             filename: "customer_data.csv",
        //             path: "/tmp/customer_selections.csv"
        //         }
        //     ],
        //     html: `<p>Here are selections made by ${req.body.email}</p>
        //             <br/>
        //             <a href=${req.body.homeDesignerUrl}>
        //             <button type="button" style="
        //                 background-color: #282A2C;
        //                 height: 40px;
        //                 border-radius: 0;
        //                 border-width: 0;
        //                 border-color: #282A2C;
        //                 width: 100%;
        //                 margin-left: 8px;
        //                 display: inline-block;
        //                 font-weight: 400;
        //                 line-height: 1.5;
        //             ">
        //                 <span style="color: #FFFFFF;
        //                         font-weight: 500;
        //                         font-size: 14px;
        //                         line-height: 24px;
        //                         text-decoration: none;
        //                         text-transform: uppercase;"
        //                 >
        //                         open home designer
        //                 </span>
        //             </button>
        //             </a>
        //             <p>Or open this link: <a rel="noreferrer" target="_blank" href=${req.body.homeDesignerUrl}>${req.body.apartment}</a></p>
        //             <p>If you want to change them, click on the link, save your choices and we’ll send you a new link with new selections. Save your choices and send them to yourself after every change, otherwise they will not be retained.</p>
        //     `,
        // }

        let emailTransporter = await createTransporter();
        try {
            let mailData = mailDataEn;
            if (req.body.lang && req.body.lang === "et") {
                mailData = mailDataEt
            }

            await emailTransporter.sendMail(mailData);
            // await emailTransporter.sendMail(recordMailData);
            res.sendStatus(200);
        } catch (e) {
            res.sendStatus(500);
        }

    } else {
        res.sendStatus(422);
    }
    // fs.unlink("/tmp/customer_selections.csv", () => {});
});

app.listen(port,() => {
    console.log(`Started on PORT ${port}`);
});
