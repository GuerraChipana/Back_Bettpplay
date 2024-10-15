import fileUpload from 'express-fileupload';

const fileUploadMiddleware = fileUpload({
    useTempFiles: false,
});


export default fileUploadMiddleware;
