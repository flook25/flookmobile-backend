import express from "express";


const app = express();
const port = 3001;
import cors from "cors";

// Controllers
import { UserController } from "./controllers/UserController.js";
import { CompanyController } from "./controllers/CompanyController.js";
import { ProductController } from "./controllers/ProductController.js";


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

// buy
app.post("/api/buy/create", ProductController.create);
app.get("/api/buy/list", ProductController.list);
app.put("/api/buy/update/:id", ProductController.update);
app.delete("/api/buy/remove/:id", ProductController.remove);


// user
app.post("/api/user/signin", UserController.signIn);


// company
app.post("/api/company/create",  CompanyController.create);
app.get("/api/company/list", CompanyController.list);


app.use((error, req, res, next) => {
    res.status(500).json({ message: error.message });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});