import type { Metadata } from "next";
import { APP_NAME } from "@/lib/config";
import { POLICY_VERSION } from "@/lib/privacy/config";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: `Condições de uso do ${APP_NAME}.`,
};

export default function TermosPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-16 md:py-24">
      <h1 className="font-display text-4xl tracking-tight md:text-5xl">Termos de Uso</h1>
      <p className="mt-6 text-muted-foreground">Versão {POLICY_VERSION} · última atualização: agosto de 2026</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <p>
          O Folio é uma ferramenta de controle financeiro pessoal. Você é responsável pelas informações
          que cadastra e pelos arquivos que envia. O produto não acessa contas bancárias nesta versão e
          não substitui aconselhamento financeiro, contábil ou jurídico.
        </p>
        <p>
          A leitura de comprovantes sugere dados para revisão. Nenhuma transação é criada sem a sua
          confirmação.
        </p>
        <p>
          Você deve manter a senha em sigilo e sair da conta em dispositivos compartilhados. Uso
          indevido, tentativa de acesso a dados de terceiros ou envio de conteúdo ilícito pode levar ao
          encerramento da conta.
        </p>
        <p>
          O acesso inicial pode ser gratuito enquanto o Folio estiver em lançamento. Recursos e
          condições podem mudar; avisos relevantes aparecem no próprio produto.
        </p>
        <p>
          Estes termos regulam o uso do serviço. O tratamento de dados pessoais está na Política de
          Privacidade, em documento separado.
        </p>
      </div>
    </article>
  );
}
