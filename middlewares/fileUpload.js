import fileUpload from 'express-fileupload';

const fileUploadMiddleware = fileUpload({
    useTempFiles: true,
});


export default fileUploadMiddleware;
