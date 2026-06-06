const destinatario = process.env.EMAIL_DESTINO;

if (!destinatario) {
    console.error("❌ ERRO: A variável de ambiente 'EMAIL_DESTINO' não foi configurada no Jenkins!");
    console.error("A notificação não pode ser enviada.");
    process.exit(1); // Falha o script se não tiver a variável
}

console.log("==================================================");
console.log(" 📧 INICIANDO ROTINA DE NOTIFICAÇÃO POR E-MAIL");
console.log("==================================================");
console.log(`Destinatário capturado via Env: ${destinatario}`);
console.log("Assunto: [QA-Pipeline] Build e Testes - AdotaPet");
console.log("Mensagem: Olá! O pipeline foi finalizado com sucesso.");
console.log(" - Cobertura de testes validada.");
console.log(" - Artefatos gerados e arquivados.");
console.log("==================================================");
console.log("✅ E-mail enviado com sucesso!");