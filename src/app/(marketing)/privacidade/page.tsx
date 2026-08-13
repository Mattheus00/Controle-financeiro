import type { Metadata } from "next";
import { APP_NAME } from "@/lib/config";
import {
  DATA_PROTECTION_CONTACT_EMAIL,
  DATA_PROTECTION_CONTACT_NAME,
  POLICY_VERSION,
  PRIVACY_CONTACT_EMAIL,
} from "@/lib/privacy/config";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: `Como o ${APP_NAME} trata dados pessoais e financeiros.`,
};

export default function PrivacidadePage() {
  const contact = DATA_PROTECTION_CONTACT_EMAIL || PRIVACY_CONTACT_EMAIL;
  const name = DATA_PROTECTION_CONTACT_NAME;

  return (
    <article className="mx-auto max-w-2xl px-4 py-16 md:py-24">
      <h1 className="font-display text-4xl tracking-tight md:text-5xl">Política de Privacidade</h1>
      <p className="mt-6 text-muted-foreground">Versão {POLICY_VERSION} · última atualização: agosto de 2026</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section className="space-y-2">
          <h2 className="font-display text-2xl text-foreground">Quem é responsável</h2>
          <p>
            O Folio é um sistema de controle financeiro pessoal. O controlador dos dados é quem opera
            este serviço. Esta política descreve o tratamento realmente implementado no produto. Não
            afirmamos certificação da ANPD nem conformidade automática com a LGPD.
          </p>
          {name || contact ? (
            <p>
              Contato de privacidade{name ? `: ${name}` : ""}
              {contact ? ` · ${contact}` : ""}.
            </p>
          ) : (
            <p>
              Pedidos sobre seus dados podem ser feitos na conta, em Configurações → Privacidade e
              dados.
            </p>
          )}
        </section>
        <section className="space-y-2">
          <h2 className="font-display text-2xl text-foreground">Quais dados coletamos</h2>
          <p>
            Dados de conta: nome, e-mail e senha (esta última fica com o provedor de autenticação, sem
            leitura pelo Folio). Dados financeiros que você cadastra: receitas, despesas, contas,
            cartões (apelido, bandeira, 4 últimos dígitos, limite, dias de fechamento e vencimento),
            categorias, estabelecimentos, assinaturas, metas e contas a pagar. Comprovantes e notas
            fiscais que você envia, e o texto extraído por OCR para você revisar. Dados técnicos de
            sessão do provedor de autenticação. Não pedimos CPF, endereço, número completo de cartão,
            CVV, PIN ou senha bancária.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-display text-2xl text-foreground">Como obtemos</h2>
          <p>
            Diretamente no cadastro e nas telas do aplicativo. Comprovantes vêm do upload que você faz.
            Não acessamos contas bancárias nesta versão.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-display text-2xl text-foreground">Finalidades</h2>
          <p>
            Autenticar a conta, mostrar seu controle financeiro, guardar comprovantes, sugerir dados de
            um comprovante para você confirmar, e atender pedidos seus de exportação ou exclusão.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-display text-2xl text-foreground">Com quem podem ser compartilhados</h2>
          <p>
            Infraestrutura: Supabase (banco, autenticação e arquivos) e Vercel (hospedagem). Leitura de
            comprovante: o arquivo enviado é processado por um provedor de visão/OCR (OpenAI) somente
            para extrair campos do documento. Logos de marcas usam um catálogo interno, sem envio do
            seu histórico financeiro. Detalhes estão em nossa documentação interna de terceiros.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-display text-2xl text-foreground">Retenção</h2>
          <p>
            Dados da conta ativa permanecem enquanto você usa o Folio. Exportações temporárias expiram
            em 24 horas. Após excluir a conta, os dados da aplicação e os arquivos associados são
            removidos; cópias de backup do provedor seguem o prazo do provedor até a rotação. Logs
            técnicos não devem conter senha, token ou conteúdo completo de comprovante.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-display text-2xl text-foreground">Tecnologias</h2>
          <p>
            Cookies estritamente necessários para sessão. Sem analytics, publicidade ou pixels neste
            momento. Comprovantes ficam em armazenamento privado e são acessados com link temporário.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-display text-2xl text-foreground">Segurança</h2>
          <p>
            Acesso autenticado, isolamento por usuário no banco (RLS), arquivos privados, validação de
            upload e cabeçalhos de segurança. Nenhum sistema elimina risco por completo.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-display text-2xl text-foreground">Seus direitos</h2>
          <p>
            Você pode acessar, corrigir, exportar e excluir dados pelo próprio aplicativo, além de
            abrir uma solicitação em Privacidade e dados. A LGPD prevê direitos ao titular; o
            atendimento concreto depende da estrutura jurídica de quem opera o Folio.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-display text-2xl text-foreground">Transferências internacionais</h2>
          <p>
            Supabase, Vercel e o provedor de OCR podem processar dados fora do Brasil, conforme a
            região configurada em cada serviço. Isso precisa ser avaliado por quem opera o produto.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-display text-2xl text-foreground">Atualizações</h2>
          <p>
            Quando esta política mudar de forma relevante, atualizaremos a versão nesta página. O uso
            continuado após a publicação da nova versão indica ciência do texto vigente, sem substituir
            aceites específicos quando forem necessários.
          </p>
        </section>
      </div>
    </article>
  );
}
