const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.listen(3000, ()=> {
    console.log("Server Started");
});

const db = mysql.createConnection(
    {
        host: '127.0.0.1',
        port: '8889',
        user: 'arctutorials',
        password: 'arctutorials',
        database: 'issues'
    }
);

db.connect((err)=> {
    if(err){
        console.log("Unable to connect to DB");
    }
    console.log("Database connected successfully");
});

/* Generic Method which handles queries */
function queryPromise(sql, values=[]){
    return new Promise((resolve, reject) => {
        db.query(sql, values, (error, results) => {
            if(error){
                reject(error);
            } else {
                resolve(results);
            }
        })
    });
}

/* POST API - Create New Resource */
app.post('/tickets', async(req, res) => {
    try {
        // collect all the data that comes in req.body 
        var { title, description, active} = req.body;

        // Validation 
        if(!title || !description){
            throw new Error("Title and Description are mandatory");
        }

        // By default we are setting active as true
        if(!active){
            active = true;
        }

        // Building the query
        const issue = [title, description, active];
        const SQL = "INSERT INTO tickets (title, description, active) VALUES (?,?,?)";

        // Executing the query
        const result = await queryPromise(SQL, issue);
        res.json({id: result.insertId, title, description, active});

    } catch(err){
        console.log(err);
        res.status(500).json({error: 'Failed to create the ticket'});
    }
});

/* Search Functionality */
app.get('/tickets/search', async(req, res) => {
    try {
        // Collect the query
        const query = req.query.q;
        const SQL = 'SELECT * FROM tickets WHERE title LIKE ? OR description LIKE ?';

        const result = await queryPromise(SQL, [`%${query}%`,`%${query}%`]);

        if(result.length === 0){
            res.status(200).json({msg: 'No Matching Records Found', length: result.length});    
        }
        res.status(200).json(result);

    } catch(err){
        res.status(500).json({error: 'Failed to search the tickets'});
    }
});

/* Read Functionality */
app.get('/tickets/:id', async(req, res) => {
    try {
        // Get the ID from URL
        const {id} = req.params;

        // Build the Query
        var SQL = 'SELECT * FROM tickets WHERE id = ?';

        const results = await queryPromise(SQL, [id]);

        if(results.length === 0){
            res.status(404).json({error: 'No Matching Tickets Found'});
        } else {
            // Found matching record
            res.status(200).json(results[0]);
        }
    } catch(err) {
        console.log(err);
        res.status(500).json({error: 'Failed to fetch the ticket details'});
    }
});

// Update Functionality */
app.put('/tickets/:id', async(req, res) => {
    try{
        // Collect data to process
        const id = req.params.id;
        const {title, description, active} = req.body; 

        // Validations -> empty, data type etc etc

        // Build our query
        const SQL = "UPDATE tickets SET title = ?, description = ?, active = ? WHERE id = ?";
        
        const result = await queryPromise(SQL, [title, description, active, id]);

        if(result.affectedRows === 0){
            res.status(404).json({error: "Unable to find matching ticket"});
        } else {
            res.status(200).json({id: id, title, description, active});
        }

    } catch(err) {
        console.log(err);
        res.status(500).json({error: "Failed tp update the ticket"});
    }
});

/* Delete functionality */
app.delete('/tickets/:id', async(req, res) => {
    try {
        // Data collection
        const id = req.params.id;
        const SQL = "DELETE FROM tickets WHERE id = ?";

        // Validations here
        
        // Building and executing the query
        const result = await queryPromise(SQL, [id]);

        if(result.affectedRows === 0){
            res.status(404).json({error: 'Unable to find any matching ticket'});
        } else {
            res.status(200).json({msg: "Successfully deleted the ticket"});
        }
    } catch(err){
        console.log(err);
        res.status(500).json({error: 'Failed to delete the ticket'});
    }
});






