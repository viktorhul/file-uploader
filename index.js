const express = require('express')
const app = express()
const formidable = require('formidable')
const path = require('path')
const fs = require('fs')
const { create } = require('domain')
const { dir } = require('console')

function createDirectoryName() {
    let directoryName = Date.now()

    fs.access(
        __dirname + '/uploads/' + directoryName,
        fs.constants.F_OK,
        (err) => {
            if (err) {
                return directoryName
            }
            else {
                directoryName = createDirectoryName()
            }
        })
}

app.post('/upload', (req, res) => {
    const upload = formidable({
        multiples: true,
        //uploadDir: __dirname + '/uploads'
    })

    upload.parse(req, (err, fields, files) => {
        if (err) {
            console.log(err)
            return res.send('Something went wrong')
        }

        let directoryName = new Date()

        fs.access(
            __dirname + '/uploads/' + directoryName,
            fs.constants.F_OK,
            (err) => {
                if (err) {
                    return directoryName
                } else {
                    return res.send('något gick fel. uppdatera sidan')
                }
            })

        fs.mkdir(__dirname + '/uploads/' + directoryName, (err) => {
            if (err) {
                console.log(err)
                return res.send('något är väldigt fel')
            }
        })

        if (Array.isArray(files.file)) {
            files.file.forEach(f => {
                fs.rename(f.filepath, __dirname + '/uploads/' + directoryName + '/' + f.originalFilename, (err) => {
                    if (err) console.log(err)
                })
            })
        } else {
            fs.rename(f.filepath, __dirname + '/uploads/' + directoryName + '/' + f.originalFilename, (err) => {
                if (err) console.log(err)
            })
        }

        return res.send("complete!")
    })
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'))
})

app.listen(process.env.PORT || 3000, () => {
    console.log('Running')
})