const express = require('express')
const app = express()
const formidable = require('formidable')
const path = require('path')
const fs = require('fs')

const PORT = process.env.PORT || 3000

const server = app.listen(PORT, () => {
    console.log('Listening on port ' + PORT)
})

const http = require('http')
const { Server } = require('socket.io')
const io = new Server(server)

function init() {
    fs.mkdir(__dirname + '/tmp', (err) => {
        if (err.code != 'EEXIST') {
            console.error('ERROR: mkdir /tmp', err)
        }
    })

    fs.mkdir(__dirname + '/uploads', (err) => {
        if (err.code != 'EEXIST') {
            console.error('ERROR: mkdir /uploads', err)
        }
    })
}

init()

app.get('/', (req, res) => {
    return res.sendFile(__dirname + '/index.html')
})

app.post('/upload', (req, res) => {
    const upload = formidable({
        multiples: true,
        uploadDir: __dirname + '/tmp',
        maxFileSize: 1024 * 1024 * 1024 * 40 // max 40 GB
    })

    upload.on('progress', (bytesReceived, bytesExpected) => {
        io.emit('progress', { progress: bytesReceived / bytesExpected })
    })

    upload.parse(req, (err, fields, files) => {
        if (err) {
            console.error("ERROR: parse upload", err)
            return res.sendStatus(500)
        }

        let directoryName = Date.now()

        fs.mkdir(__dirname + '/uploads/' + directoryName, (err) => {
            if (err) {
                console.error("ERROR: mkdir /uploads/" + directoryName, err)
                return res.sendStatus(500)
            }
        })

        const fileNames = Object.keys(files)

        fileNames.forEach(a => {
            f = files[a]
            fs.copyFile(f.filepath, __dirname + '/uploads/' + directoryName + '/' + f.originalFilename, fs.constants.COPYFILE_EXCL, (err) => {
                if (err) {
                    console.error("ERROR: move from /tmp to /uploads/" + directoryName, err)
                    return res.sendStatus(500)
                }
            })
        })

        return res.json({ ok: true })
    })
})
