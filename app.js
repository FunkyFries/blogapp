const expressSanitizer = require("express-sanitizer"),
    methodOverride  = require("method-override"),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose")
    express         = require("express"),
    app             = express();

//SETUP ejs, express, bodyParser, expressSanitizer, and method-override(for PUT and DELETE methods)
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//SETUP mongoose database, schema, and model
mongoose.connect("mongodb://localhost/blogapp", { useNewUrlParser: true });
mongoose.set("useFindAndModify", false);

const blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});
const Blog = mongoose.model("Blog", blogSchema);

//RESTFUL ROUTES
app.get("/", function(req, res){
    res.redirect("/blogs");
});

// INDEX ROUTE
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err);
        } else {
            res.render("index", {blogs: blogs});
        }
    });
});

//NEW ROUTE
app.get("/blogs/new", function(req, res){
    res.render("new");
});
//CREATE ROUTE
app.post("/blogs", function(req, res){
    //create blog
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        } else{
            //then, redirect to index
            res.redirect("/blogs");
        }
    });
});

//SHOW ROUTE
app.get("/blogs/:id", function(req, res){
    Blog.findOne({ _id: req.params.id }, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: foundBlog});
        }
    });
});

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
    Blog.findOne({_id: req.params.id}, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    })
});

//UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
        req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.findOneAndUpdate({_id: req.params.id}, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

//DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
    Blog.findOneAndDelete(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
});

app.listen(3000, function(){
    console.log("Server Started");
});