from diagrams import Diagram, Cluster, Edge, Node
from diagrams.aws.database import Dynamodb
from diagrams.aws.storage import S3
from diagrams.aws.security import Cognito, IAMAWSSts as STS
from diagrams.generic.compute import Rack
from diagrams.generic.blank import Blank
from diagrams.onprem.client import User

graph_attrs = {
    "fontname": "Helvetica",
    "fontsize": "13",
    "pad": "0.75",
    "splines": "ortho",
    "nodesep": "0.8",
    "ranksep": "1.2",
    "bgcolor": "#ffffff",
}

node_attrs = {
    "fontname": "Helvetica",
    "fontsize": "11",
}

with Diagram(
    "Truss — Target State: Request / Data Flow",
    filename="/Users/joycewambui/Documents/projects/truss/diagrams/truss-target-state-overview",
    outformat="svg",
    show=False,
    direction="TB",
    graph_attr=graph_attrs,
    node_attr=node_attrs,
):
    browser = User("Browser\ncreator uploads, views dashboard")

    with Cluster(
        "Vercel Edge Network",
        graph_attr={
            "bgcolor": "#f5f5f5",
            "style": "rounded",
            "color": "#555555",
            "fontcolor": "#333333",
            "penwidth": "2",
        },
    ):
        edge_sec = Rack("Edge security + rate limiting\nCSP/HSTS/X-Frame-Options,\nproxy.ts session check, rate limiter")
        app_router = Blank(
            "Next.js 16 App Router\nPages + API routes + Server Actions\nauth() + Zod + CSRF checks on all routes"
        )

    sts = STS("AWS STS (OIDC)\nVercel OIDC → temporary scoped\ncredentials, no long-lived keys")

    with Cluster(
        "AWS (eu-west-1)",
        graph_attr={
            "bgcolor": "#fff8f0",
            "style": "rounded",
            "color": "#dd6b20",
            "fontcolor": "#333333",
            "penwidth": "2",
        },
    ):
        dynamo = Dynamodb("truss-main\n(single table,\ninc. magic-link tokens)")
        s3 = S3("truss-uploads\n(presigned, scoped bucket)")
        cognito = Cognito("User Pool\n(signup / verify)")

        with Cluster(
            "AI Analysis Pipeline",
            graph_attr={
                "style": "dashed",
                "color": "#888888",
                "bgcolor": "#f9f9f9",
                "fontcolor": "#555555",
            },
        ):
            clip_pipeline = Blank("AI highlight scoring\n(Google Gemini)")

    with Cluster(
        "External APIs",
        graph_attr={
            "bgcolor": "#f0f4ff",
            "style": "rounded",
            "color": "#4a6fa5",
            "fontcolor": "#333333",
            "penwidth": "2",
        },
    ):
        stripe = Blank("Stripe\n(Checkout + Webhooks)")
        gemini = Blank("Google AI\n(gemini-3.5-flash)")
        resend = Blank("Resend\n(magic link email)")

    # Edges
    browser >> Edge(label="HTTPS/TLS") >> edge_sec
    edge_sec >> app_router
    app_router >> sts
    sts >> dynamo
    sts >> s3
    sts >> cognito
    app_router >> clip_pipeline
    app_router >> Edge(label="magic link", style="dashed") >> resend
    app_router >> Edge(label="webhook", style="dashed") >> stripe
    stripe >> Edge(style="dashed") >> app_router
    clip_pipeline >> gemini
