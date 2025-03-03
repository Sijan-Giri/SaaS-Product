const multer = require("multer");

const storage = multer.diskStorage({
    destination : function(req,file,cb) {
        const allowedFileTypes = ['image/jpg',"image/jpeg","image/png"]
        if(!allowedFileTypes.includes(file.mimetype)) {
            cb(new Error("Invalid Filetype"))
            return
        }
        cb(null,"uploads/")
    },
    filename : function(req,file,cb) {
        cb(null,Date.now() + "-" + file.originalname)
    }
})

module.exports = {storage , multer}