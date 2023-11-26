const express = require('express');
const path = require('path')
const {open}=require('sqlite')
const sqlite3 = require('sqlite3')
const dbPath = path.join(__dirname,'goodreads.db')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const app = express();
app.use(express.json())

app.use(cors())

let db=null;

const initializeDB = async ()=>{
    try{
        db=await open({
        filename:dbPath,
        driver:sqlite3.Database
    });
    app.listen(4000,()=>{
        console.log(`The Server is running at http://localhost:4000`)
    });
}catch(e){
    console.log(e.message)
    process.exit(1)
}
}

app.get('/books/:id',async(request,response)=>{
    const {params} = request;
    const {id} = params;
    const getDetailsQuery=`
        SELECT * FROM book WHERE book_id=${id};
    `
    const details = await db.get(getDetailsQuery);
    response.send(details)
})

app.post('/books/',async(request,response)=>{
    const bookDetails=request.body
    const {title,authorId,rating,ratingCount,reviewCount,description,pages,dateOfPublication,editionLanguage,price,onlineStores} = bookDetails
    const addBooksQuery=`
        INSERT INTO book (
            title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
            VALUES(
                '${title}',
                ${authorId},
                ${rating},
                ${ratingCount},
                ${reviewCount},
                '${description}',
                ${pages},
                '${dateOfPublication}',
                '${editionLanguage}',
                '${price}',
                '${onlineStores}'
            )
          
            
    `
    const getDetails=await db.run(addBooksQuery)
    const bookId = getDetails.lastID
    response.send({bookId:bookId})
    
})

app.get('/',async(request,response)=>{
    let jwtToken;
    const authHeader=request.headers['authorization']
    if(authHeader===undefined){
        response.status(401)
        response.send("Invalid JWT token");
    }else{
        jwtToken=authHeader.split(' ')[1]
        if(jwtToken===undefined){
            response.status(401)
            response.send("Invalid Jwt Token")
        }else{
            jwt.verify(jwtToken,'vamsi',async (error,user)=>{
                if(error){
                    response.status(401)
                    response.send("Invalid JWT Token")
                }else{
                    const getDetailsQuery = `SELECT * FROM book`
                    const responseData = await db.all(getDetailsQuery)
                    response.send(responseData)
                }
            })
        }
    }
})

app.get('/books/',async(request,response)=>{
    const {limit=10,offset=0,order_by="book_id",search='',order="ASC"} = request.query
    let jwtToken;
    const authHeader = request.headers["authorization"]
    if(authHeader!==undefined){
        jwtToken=authHeader.split(" ")[1]
        if(jwtToken!==undefined){
            jwt.verify(jwtToken,"vamsi",async(error,user)=>{
                if(error){
                    response.status(401);
                    response.send("Invalid JWT token")
                }else{
                    const getDetailsQuery=`
                        SELECT * FROM book
                        WHERE title LIKE '%${search}%'
                        ORDER BY  ${order_by} ${order}
                        LIMIT ${limit} OFFSET ${offset};
                        `

                        const getResponse = await db.all(getDetailsQuery);
                        response.send(getResponse)
                }
            })
        }else{
            response.status(401);
            response.send("Invalid Access TOken")
        }
    }else{
        response.status(401)
    }
})

app.post('/usersLogin/',async(request,response)=>{
    const details = request.body
    const {name,username,password,gender} = details
    const checkUsernameQuery = `SELECT * FROM user WHERE username='${username}'`;
    const hashedPassword=await bcrypt.hash(password,10);
    console.log(hashedPassword)
    const userStatus=await db.get(checkUsernameQuery)
    if(userStatus===undefined){

                const addQuery = `
                    INSERT INTO user 
                    (username,name,password,gender)
                    VALUES (
                        '${username}',
                        '${name}',
                        '${hashedPassword}',
                        '${gender}'   
                    )
                `;
                await db.run(addQuery)
                response.send("User Created Successfully !!!")
            
    }else{
        response.send('Username Already Exists!!')
    }
})

app.get('/usersLogin',async(request,response)=>{
    const getDetailsQuery = `SELECT * FROM user`

    const responseData = await db.all(getDetailsQuery)
    response.send(responseData)
})

app.post('/login',async(request,response)=>{
    const {username,password} = request.body 
    const checkUsernameQuery = `SELECT * FROM user WHERE username='${username}'`
    const getStatus=await db.get(checkUsernameQuery)
    if(getStatus===undefined){
        response.send("Username Does Not Exist");
    }else{
        const checkPassword = await bcrypt.compare(password,getStatus.password)
        if(checkPassword===false){
            response.send('Password is Incorrect');
        }else{
            const jwtToken=jwt.sign({username:username},'vamsi')
            response.send({jwtToken})
        }
    }
})

initializeDB();

