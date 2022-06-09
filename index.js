const express = require('express')
const app = express()
const formidable = require('formidable')
const path = require('path')
const fs = require('fs')

const server = app.listen(process.env.PORT || 3000, () => {
    console.log('Running')
})

const http = require('http')
const { Server } = require('socket.io')
const io = new Server(server)

fs.access(__dirname + '/tmp', fs.constants.F_OK, (err) => {
    if (err) {
        fs.mkdir(__dirname + '/tmp', (err) => {
            if (err) { console.log(err) }
        })
    }
})

app.get('/', (req, res) => {
    return res.sendFile(__dirname + '/index.html')
})

app.post('/upload', (req, res) => {
    const upload = formidable({
        multiples: true,
        uploadDir: __dirname + '/tmp',
        maxFileSize: 1024 * 1024 * 1024 * 20
    })

    upload.on('progress', (bytesReceived, bytesExpected) => {
        io.emit('progress', { progress: bytesReceived / bytesExpected })
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

        const fileNames = Object.keys(files)
        //if (Array.isArray(files.file)) {
        fileNames.forEach(a => {
            f = files[a]
            fs.copyFile(f.filepath, __dirname + '/uploads/' + directoryName + '/' + f.originalFilename, fs.constants.COPYFILE_EXCL, (err) => {
                if (err) console.log(err)
            })
        })
        /*} else {

            //console.log(__dirname + '/uploads/' + directoryName + '/' + files.originalFilename)
            fs.copyFile(files.filepath, __dirname + '/uploads/' + directoryName + '/' + files.originalFilename, fs.constants.COPYFILE_EXCL, (err) => {
                if (err) console.log(err)
            })
        }*/

        return res.sendFile(path.join(__dirname, '/public/complete.html'))
    })
})
