const express = require('express')
const app = express()
const formidable = require('formidable')
const path = require('path')
const fs = require('fs')

fs.access(__dirname + '/tmp', fs.constants.F_OK, (err) => {
    if (err) {
        fs.mkdir(__dirname + '/tmp', (err) => {
            if (err) { console.log(err) }
        })
    }
})

app.post('/upload', (req, res) => {
    const upload = formidable({
        multiples: true,
        uploadDir: __dirname + '/tmp'
    })

    upload.parse(req, (err, fields, files) => {
        if (err) {
            console.log(err)
            return res.send('Something went wrong')
        }

        let directoryName = Date.now()

        /*
        fs.access(
            __dirname + '/uploads/' + directoryName,
            fs.constants.F_OK,
            (err) => {
                if (err) {
                    return directoryName
                } else {
                    return res.send('något gick fel. uppdatera sidan')
                }
            })*/

        fs.mkdir(__dirname + '/uploads/' + directoryName, (err) => {
            if (err) {
                console.log(err)
                return res.send('något är väldigt fel')
            }
        })

        if (Array.isArray(files.file)) {
            files.file.forEach(f => {
                fs.copyFile(f.filepath, __dirname + '/uploads/' + directoryName + '/' + f.originalFilename, fs.constants.COPYFILE_EXCL, (err) => {
                    if (err) console.log(err)
                })
            })
        } else {
            fs.copyFile(files.file.filepath, __dirname + '/uploads/' + directoryName + '/' + files.file.originalFilename, fs.constants.COPYFILE_EXCL, (err) => {
                if (err) console.log(err)
            })
        }

        return res.sendFile(path.join(__dirname, '/public/complete.html'))
    })
})

app.get('*', (req, res) => {
    return res.sendFile(path.join(__dirname, '/public/index.html'))
})

app.listen(process.env.PORT || 3000, () => {
    console.log('Running')
})