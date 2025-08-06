import nodemailer from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

interface EmailOptions{
    to: string
    subject: string
    html: string
    text?: string
}

//Validação de variaveis de ambiente 

const { 
    MAILGUN_SMTP_HOST,
    MAILGUN_SMTP_PASS,
    MAILGUN_SMTP_PORT,
    MAILGUN_SMTP_USER
} = process.env;

if(!MAILGUN_SMTP_HOST || !MAILGUN_SMTP_PASS || !MAILGUN_SMTP_PORT || !MAILGUN_SMTP_USER){
    throw new Error('Variáveis de ambiente SMTP Mailgun não estão definidas corretamente')
}
//Conexão SMTP 
const transporter = nodemailer.createTransport({
    host: process.env.MAILGUN_SMTP_HOST,
    port: Number(process.env.MAILGUN_SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.MAILGUN_SMTP_USER,
        pass: process.env.MAILGUN_SMTP_PASS,
    }

})

/*Envio de um email genérico(configurar depois) */

export async function sendMail({to, subject, html, text}: EmailOptions) {
    try{
        return transporter.sendMail({
        from: `Pavito Velas <no-reply@${process.env.MAILGUN_SMTP_USER?.split('@')[1]}>`,
        to,
        subject,
        html,
        text: text ?? html.replace(/<[^>]+>/g, ''), // versão plain-text
        })
    }catch(error){
        console.error('Erro ao enviar e-mail', error);
        throw error;
    }
}

/*E-mail de confirmação de pagamento*/

export async function sendPaymentConfirmed(to: string, produtos: string[]) {
    const subject = 'Pagamento Confirmado ✔️'
    const html = `<p>Olá! Seu pedido <strong>${produtos.join(', ')}</strong> foi confirmado com sucesso.</p>
    <p>Em breve começaremos o processamento.</p>`;

    return sendMail({to, subject, html})
}

export async function sendPaymentPending(to: string, pedidoId: BigInt) {
    const subject = 'Aguardando Pagamento'
    const html = `<p>Olá! Recebemos seu pedido <strong>${pedidoId.toString()}</strong>, mas ainda estamos aguardando o pagamento.</p>
    <p>Assim que confirmado, enviaremos a confirmação.</p>`;

    return sendMail({to, subject, html})
}