const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
// const router = require("./router");

const app = express();

const port = process.env.PORT || 3000;
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const user = require("./model/user");
const shippingDetails = require("./model/shippingDetails")
const addProducts = require("./model/addProducts")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { response } = require("express");
// var router = express.Router();

const JWT_SECRET =
  'sdksghshfgsjhvsfdkvghsdkbvf23@T#@^&$%ksjdvfjkg;la"vn,vpsajsd;kvnfbh'; //don't change the key even single character
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

mongoose
  .connect("mongodb+srv://mahesh:KzduirdN4d2LvXXN@cluster0.og4xoqg.mongodb.net/?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log("DB Connected!");
  })
  .catch((err) => {
    console.log(Error, err.message);
  });


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(
  session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true,
  })
);










//register user
app.post('/signup', async (req, res) =>{

  const {username, email, password: plainTextPassword} = req.body

  if(!username || typeof username !== 'string'){
     return res.json({status: 'error', error: 'Invalid Username'})
  }

  if(!plainTextPassword || typeof plainTextPassword !== 'string'){
     return res.json({status: 'error', error: 'Invalid password'})
  }

  if(plainTextPassword.length < 5){
     return res.json({status: 'error', error: 'password too small. Should be atleast 6 characters'})
  }

  const password = await bcrypt.hash(plainTextPassword, 10)

  try{
     const response = await user.create({
        username,
        email,
        password
     })
     console.log('user created successfully:',response)
  }catch(error){
     if(error.code === 11000){
        //duplicate key
        return res.json({status: 'error', error: 'Username already in use'})
     }
     throw error
  }
  req.session.email = req.body.email
  req.session.username = req.body.username;
  return res.redirect('/')
  res.json({status: 'ok'})
 });

//login user
app.post('/login', async (req, res) =>{
  const {email, password} = req.body
  const User = await user.findOne({email}).lean()
  // console.log(User.username)

  if(!user){
     return res.json({status: 'error', error: 'Invalid Username/password'})
  }

  if(await bcrypt.compare(password, User.password)){

     const token = jwt.sign({id: User._id, username: User.username},
        JWT_SECRET
        )
     req.session.email = User.email;
     req.session.username = User.username;
     return res.redirect('/')
     return res.json({status: 'ok', data: 'token'})
  }


  res.json({status: 'error', data: 'Invalid Username/password'})

});
app.get("/homee",(req,res)=>{
  res.render("home1");
})
app.get("/aboute",(req,res)=>{
  res.render("about");
})
app.get("/contacte",(req,res)=>{
  res.render("contact");
})
app.get("/home2",(req,res)=>{
  res.render("home2");
})
app.get("/about1",(req,res)=>{
  res.render("about1");
})
app.get("/contact1",(req,res)=>{
  res.render("contact1");
})
//route for logout
app.get('/logout', (req, res) => {
  req.session.destroy(function(err){
     if(err){
        console.log(err);
        res.send('Error')
     }else{
        res.redirect('/') //{title: "Express", logout:"Logout Successful...."}
     }
  })
})

app.post('/addShippingDetails', async (req, res) =>{
  console.log('calling')

  const {phone, adline1, adline2, city, postcode, country} = req.body
  if(req.session.username){
    const email = req.session.email;
  
    if(!email || !phone || !adline1 || !adline2 || !city || !postcode || !country ){
      return res.json({status: 'error', error: 'Enter All Fields'})
    }

   try{
      const response = await shippingDetails.create({
       email,
       phone,
       adline1,
       adline2,
       city,
       postcode,
       country
      })
      console.log('user shipping details created successfully:',response)
   }catch(error){
         return res.json({status: 'error', error:  error})
   }
   req.session.email
   req.session.username

   console.log(req.session.orderId)
  
    res.redirect('/profile')
  }else{
    res.redirect('/login')
 }
 });

app.post('/addProduct', async (req, res) =>{
  console.log('called addProduct router')

  const {id, src, title, description, price} = req.body
  if(req.session.username){
    if(!id || !title || !src || !description || !price){
      return res.json({status: 'error', error: 'Enter All Fields'})
    }

   try{
      const response = await addProducts.create({

      id,
      src,
      title,
      description,
      price

      })
      console.log('Product details created successfully:',response)
   }catch(error){
         return res.json({status: 'error', error:  error})
   }
   req.session.email
   req.session.username

    res.redirect('/AddingProducts')
  }else{
    res.redirect('/login')
 }
 });



 app.get('/VintageCar/:id', (req, res) => {
  // console.log(req.params);
    console.log('called productsdet');
  // getting the id from the url
  const addProductId = req.params.id;

  // getting the post from the database using the id from the url
  addProducts.findById(addProductId, (err, result) => {
      if(err){
          console.log(err);
          res.send('Error loading post');
      }
      else{
          res.render('VintageCar', { product: result });
          console.log(result);
      }
  });
})



app.get('/billing/:id', (req, res) => {
  // console.log(req.params);
    console.log('called productsdet');

  if(req.session.username){
      // getting the id from the url
  const addProductId = req.params.id;

  // getting the post from the database using the id from the url
  addProducts.findById(addProductId, (err, result) => {
      if(err){
          console.log(err);
          res.send('Error loading post');
      }
      else{
        const email = req.session.email
        shippingDetails.find({email:email}, (err, sresult) => {
          if(err){
              console.log(err);
              res.send('not find shipping details');
          }
          else{
          const  sdetails = sresult
          const product = result
          console.log(product);
          console.log(sdetails);

          res.render('billing', { product,sdetails, username:req.session.username, email:req.session.email});
          }
      });
      }
  });
  }else{
      res.render('login')
  }  
  
})


app.get("/order_confirmation/:id", (req, res) => {
 // console.log(req.params);
 console.log('called productsdet');
  // getting the id from the url
 const addProductId = req.params.id;

// getting the post from the database using the id from the url
  addProducts.findById(addProductId, (err, result) => {
    if(err){
        console.log(err);
        res.send('Error loading post');
    }
    else{
        result.purchaseStatus = true
        res.render('order_confirmation', { product: result, username:req.session.username, email:req.session.email });
        console.log(result);
    }
});

});
app.get("/letsPrepare",(req,res)=>{
  res.render("let");
})

app.get("/goToDashboard",(req,res)=>{
  res.render("dashboard");
})
app.get('/', (req, res) => {

  if(req.session.username){
      res.render('Home1', {username:req.session.username})
  }else{
      res.render('Home1')
  }
;
});

app.get('/profile', (req, res) => {

    if(req.session.username){
      const email = req.session.email
      shippingDetails.find({email:email}, (err, result) => {
        if(err){
            console.log(err);
            res.send('not find shipping details');
            res.render('shippingDetails')
        }
        else{
        const  sdetails = result
            // res.redirect('billing/'+ sdetails);
            // console.log(result);
            res.render('dashboard', {username:req.session.username, email:req.session.email, sdetails})
        }
    });
    }else{
      res.render('login')
    }
});


app.get("/sign-up", (req, res) => {
  res.render("signup", { title: "Login System" });
});

app.get("/login", (req, res) => {
  res.render("login", { title: "Login System" });
});
app.post("/afterlogin",(req,res)=>{
  var n=req.body.username;
  res.render("home2",{username:n});
})
app.get("/products", (req, res) => {
  if(req.session.username){
   // mongoose operations are asynchronous, so you need to wait
   addProducts.find({}, function(err, data) {
    // note that data is an array of objects, not a single object!
    res.render('products', {
        user : req.user,
        products: data,
        username:req.session.username
    });
    console.log(data);
});
}else{
  res.render('login')
}
});

app.get("/Latest", (req, res) => {
  if(req.session.username){
    res.render('Latest', {username:req.session.username})
  }else{
    res.render('Latest')
}
});

app.get("/Categories", (req, res) => {
  if(req.session.username){
    res.render('Categories', {username:req.session.username})
  }else{
    res.render('Categories')
  }
});



app.get("/category_T-shirt", (req, res) => {
  if(req.session.username){
    res.render('category_T-shirt', {username:req.session.username})
  }else{
    res.render('category_T-shirt')
  }
});

app.get("/AddingProducts", (req, res) => {
  if(req.session.username){
    res.render('AddingProducts', {username:req.session.username})
  }else{
    res.render('AddingProducts')
  }
});

app.get("/VintageCar", (req, res) => {
  if(req.session.username){
    res.render('VintageCar', {username:req.session.username})
  }else{
    res.render('VintageCar')
  }
});

app.get("/AntiquePainting", (req, res) => {
  if(req.session.username){
    res.render('AntiquePainting', {username:req.session.username})
  }else{
    res.render('AntiquePainting')
  }
});

app.get("/AntiqueArtifacts", (req, res) => {
  if(req.session.username){
    res.render('AntiqueArtifacts', {username:req.session.username})
  }else{
    res.render('AntiqueArtifacts')
  }
});



app.get("/category_paintings", (req, res) => {
  if(req.session.username){
    res.render('category_paintings', {username:req.session.username})
  }else{
    res.render('category_paintings')
  }
});

app.get("/category_ancient", (req, res) => {
  if(req.session.username){
    res.render('category_ancient', {username:req.session.username})
  }else{
    res.render('category_ancient')
  }
});
app.post("/goToDashboard2",(req,res)=>{
  var n=req.body.yourname;
  var en=req.body.examname;
  var cn=req.body.centername;
  res.render("dashboard2",{yourname:n,examname:en,centername:cn});
})
app.get("/shippingDetails", (req, res) => {

  if(req.session.username){
    res.render('shippingDetails', {username:req.session.username})
  }else{
    res.render('shippingDetails')
  }
});



app.listen(port, () => {
  console.log(`The server is listening at port ${port}`);
});
