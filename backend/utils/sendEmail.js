import nodemailer from 'nodemailer';

const sendEmail = async (subject, message, send_to, sent_from, reply_to)=> {
    //Create Email Trasnporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls:{
            rejectUnauthorized: false
        }
    });

    console.log(process.env.EMAIL_USER);
    console.log(process.env.EMAIL_PASS);

    //Options to send mail
    const options = {
        from: process.env.EMAIL_USER,
        to: send_to,
        replyTo: reply_to,
        subject: subject,
        html: message
    }

    // Send email
    transporter.sendMail(options, function(err, info){
        if(err) {
            console.log(err);
        }
        else {
            console.log(info);
        }
    })
}

export default sendEmail;