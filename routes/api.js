const express = require('express');
const router = express.Router();
const fs = require('fs');

const createFile = async (fileName, item) => {
    try {
        fs.writeFileSync(fileName, item);

        console.log(`${fileName} has been created.`);

    } catch (error) {
        if (error.code === 'ECONNRESET') {
            console.error(`Network connection was reset while creating ${fileName}`);
        } else {
            console.error(`Error creating ${fileName}:`, error);
        }
    }
};

// Function to read JSON file and return its data
function readJSONFile(filename, callback) {
    fs.readFile(filename, 'utf8', (err, data) => {
        if (err) {
            callback(err);
            return;
        }
  
        try {
            const jsonData = JSON.parse(data);
            callback(null, jsonData);
        } catch (parseError) {
            callback(parseError);
        }
    });
}

router.post('/iframe-css', async (req, res) => {
    let token = req.body.token
    const filePath = `./storage/iframe-${token}.json`;

    let items = [];

    if (fs.existsSync(filePath)) {
        readJSONFile(filePath, (err, data) => {
            if (err) throw err;
            items = data.items;

            res.json(items);
        });
    }
})

router.post('/save-to-storage', async (req, res) => {
    var created = {
        'token': new Date().getTime(),
        'items': req.body
    }
    
    let dir = `./storage/iframe-${created.token}.json`;

    await createFile(dir, JSON.stringify(created));

    res.json(created);
});

router.get('/generator', (req, res) => {
    res.render('pages/generator');
})

module.exports = router;