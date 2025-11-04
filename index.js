import express from "express";
import expressLayouts from "express-ejs-layouts";
import session from "express-session";
import cookieParser from "cookie-parser";
import flash from "connect-flash";
import mongoose from "mongoose";
import methodOverride from "method-override";
import { Hk } from "./model/hk.js";
import { check, validationResult } from "express-validator";

const port = 3000;
const app = express();

// Connect MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/rph");

// Middleware
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use("/public", express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Configuration flash
app.use(cookieParser("secret"));
app.use(
    session({
        cookie: { maxAge: 6000 },
        secret: "secret",
        resave: true,
        saveUninitialized: true,
    })
);
app.use(flash());

// Root
app.get("/", (_, res) => {
    res.render("index", {
        title: "Home",
        layout: "layouts/main",
    });
});

// About
app.get("/about", (_, res) => {
    res.render("about", {
        title: "About",
        layout: "layouts/main",
    });
});

// Contact
app.get("/contact", async (req, res) => {
    const data = await Hk.find();
    res.render("contact", {
        title: "Contact",
        layout: "layouts/main",
        data,
        message: req.flash("message"),
    });
});

// Form Add Contact
app.get("/contact/add", (_, res) => {
    res.render("add", {
        title: "Add Contact",
        layout: "layouts/main",
    });
});
app.post(
    "/contact",
    check("name").custom(async (name) => {
        const duplicate = await Hk.findOne({ name: name });
        if (duplicate) {
            throw new Error("Name is Registered");
        }
        return true;
    }),
    check("phone", "Number Phone is Not Valid").isMobilePhone("id-ID"),
    check("email", "Email is Not Valid").isEmail().optional({ checkFalsy: true }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render("add", {
                title: "Add Contact",
                layout: "layouts/main",
                errors: errors.array(),
            });
        } else {
            await Hk.insertMany(req.body);
            req.flash("message", "New Contact Added Successfully");
            res.redirect("/contact");
        }
    }
);

// Form Update Contact
app.get("/contact/update/:name", async (req, res) => {
    const contact = await Hk.findOne({ name: req.params.name });
    res.render("update", {
        title: "Update Contact",
        layout: "layouts/main",
        contact,
    });
});
app.put(
    "/contact",
    check("name").custom(async (name, { req }) => {
        const duplicate = await Hk.findOne({ name });
        if (req.body.oldName !== name && duplicate) {
            throw new Error("Name is Registered");
        }
        return true;
    }),
    check("phone", "Number Phone is Not Valid").isMobilePhone("id-ID"),
    check("email", "Email is Not Valid").isEmail().optional({ checkFalsy: true }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render("update", {
                title: "Add Contact",
                layout: "layouts/main",
                errors: errors.array(),
                contact: req.body,
            });
        } else {
            const contact = await Hk.findOne({ _id: req.body._id });
            // res.send(contact)
            await Hk.updateOne(
                { _id: contact._id },
                {
                    $set: {
                        name: req.body.name,
                        phone: req.body.phone,
                        dapartement: req.body.dapartement,
                        email: req.body.email,
                    },
                }
            );
            req.flash("message", `Contact ${req.body.name} Updated Successfully`);
            res.redirect("/contact");
        }
    }
);

// Delete Contact
app.delete("/contact/:id", async (req, res) => {
    const contact = await Hk.findOne({ _id: req.params.id });
    if (!contact) {
        res.status(404).send("Contact Not Found");
    } else {
        await Hk.deleteOne({ _id: contact._id });
        req.flash("message", `Contact ${contact.name} Deleted Successfully`);
        res.redirect("/contact");
    }
});

// Detail Contact
app.get("/contact/:name", async (req, res) => {
    const dataDetail = await Hk.findOne({ name: req.params.name });
    res.render("detail", {
        title: "Detail Contact",
        layout: "layouts/main",
        dataDetail,
    });
});

// Error 404
app.use("/", (_, res) => {
    res.status(404);
    res.send("Page Not Found\n 404");
});

app.listen(port, () => console.log(`ContactApp listen to http://127.0.0.1:${port}`));
