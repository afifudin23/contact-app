import express from "express";
import expressLayouts from "express-ejs-layouts";

const port = 8000;
const app = express();

app.set("view engine", "ejs");
app.use(expressLayouts);
app.use("/public", express.static("public"));

// Root
app.get("/", (_, res) => {
    res.render("index", {
        title: "Home",
        layout: "layouts/main"
    });
});

app.listen(port, () => console.log(`ContactApp listen to https://127.0.0.1:${port}`));