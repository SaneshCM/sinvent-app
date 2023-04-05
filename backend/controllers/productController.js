import asyncHandler from "express-async-handler";
import Product from '../models/productModel.js';
import { fileSizeFormatter } from "../utils/fileUpload.js";
import { v2 as cloudinary } from 'cloudinary'


const createProduct = asyncHandler(async(req, res) => {
    
    const {name, sku, category, quantity, price, description} = req.body;

    //Validation
    if(!name || !category || !quantity || !price ||!description) {
        res.status(500);
        throw new Error("Please fill in all fields");
    }

    // Handle image upload
    let fileData = {}
    if(req.file) {
        // Save image to cloudinary
        let uploadedFile;
        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path, {folder: "Sinvent App", resource_type: "image"})
        } catch (error) {
            res.status(500);
            throw new Error("Image could not be uploaded");
        }
        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2)

        }
    }
    //create product
    const product = await Product.create({
        user: req.user._id,
        name,
        sku, 
        category,
        quantity,
        price, 
        description,
        image: fileData
    });

    res.status(201).json(product);
});

// Get all products
const getProducts = asyncHandler ( async (req, res) => {
    const products = await Product.find({user: req.user._id}).sort("-createdAt");
    res.status(200).json(products);
});

// Get single products
const getProduct = asyncHandler ( async (req, res) => {
    const product = await Product.findById(req.params.id);
    if(!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    if(product.user.toString() != req.user._id.toString()) {
        res.status(401);
        throw new Error("User not authorized");
    }
    res.status(200).json(product);
});

// Delete a product
const deleteProduct = asyncHandler (async (req, res)=>{
    const product = await Product.findById(req.params.id);
    if(!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    if(product.user.toString() != req.user._id.toString()) {
        res.status(401);
        throw new Error("User not authorized");
    }
    await Product.deleteOne(product);
    res.status(200).json({message: "Product Deleted."});
});

//Update Product
const updateProduct = asyncHandler (async (req, res)=>{
    const {name, category, quantity, price, description} = req.body;

    const product = await Product.findById(req.params.id);
    
    if(!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    if(product.user.toString() != req.user._id.toString()) {
        res.status(401);
        throw new Error("User not authorized");
    }

    // Handle image upload
    let fileData = {}
    if(req.file) {
        // Save image to cloudinary
        let uploadedFile;
        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path, {folder: "Sinvent App", resource_type: "image"})
        } catch (error) { 
            res.status(500);
            throw new Error("Image could not be uploaded");
        }
        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2)

        }
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
        {
        _id: req.params.id
        },
        {
            name,
            category,
            quantity,
            price, 
            description,
            image: Object.keys(fileData).length === 0 ? product.image : fileData
        },
        {
            new: true,
            runValidators:true
        }
    )

    res.status(200).json(updatedProduct);
});

export {createProduct, getProducts, getProduct, deleteProduct, updateProduct}; 