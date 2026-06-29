"""
Truss — Target State Architecture
Organized along AWS Well-Architected Framework pillars:
  - Security:            Identity boundary (Cognito/STS), edge security, no long-lived creds
  - Reliability:          Clear request vs. async/event paths
  - Operational Excellence: Observability called out explicitly
  - Performance/Cost:     Edge caching + serverless compute noted at the Vercel layer

Legend:
  solid edge   = synchronous request/response
  dashed edge  = async / event / webhook
  dotted edge  = telemetry / observability
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.database import Dynamodb
from diagrams.aws.storage import S3
from diagrams.aws.security import Cognito, IAMAWSSts as STS
from diagrams.aws.management import Cloudwatch
from diagrams.generic.compute import Rack
from diagrams.generic.blank import Blank
from diagrams.onprem.client import User

graph_attrs = {
    "fontname": "Helvetica",
    "fontsize": "16",
    "fontcolor": "#222222",
    "pad": "0.8",
    "splines": "spline",
    "nodesep": "1.0",
    "ranksep": "1.6",
    "bgcolor": "#ffffff",
    "labelloc": "t",
    "compound": "true",
}

node_attrs = {
    "fontname": "Helvetica",
    "fontsize": "11",
    "fontcolor": "#222222",
}

edge_attrs = {
    "fontname": "Helvetica",
    "fontsize": "10",
    "fontcolor": "#555555",
}

# Edge semantics — consistent across the whole diagram
REQUEST = {"color": "#2b6cb0", "style": "solid", "penwidth": "1.6"}
ASYNC = {"color": "#dd6b20", "style": "dashed", "penwidth": "1.4"}
TELEMETRY = {"color": "#888888", "style": "dotted", "penwidth": "1.0"}
TRUST = {"color": "#9b2c2c", "style": "bold", "penwidth": "1.6"}

with Diagram(
    "Truss — Target State: Request / Data Flow\n(Well-Architected: Security · Reliability · Ops Excellence)",
    filename="/Users/joycewambui/Documents/projects/truss/diagrams/truss-target-state-overview",
    outformat="svg",
    show=False,
    direction="LR",
    graph_attr=graph_attrs,
    node_attr=node_attrs,
    edge_attr=edge_attrs,
):
    browser = User("Browser\ncreator uploads, views dashboard")

    # ---- Edge / compute layer (Performance Efficiency + Cost) ----
    with Cluster(
        "Vercel Edge Network  —  Performance & Cost\nedge caching · serverless compute",
        graph_attr={
            "bgcolor": "#f5f5f5",
            "style": "rounded",
            "color": "#555555",
            "fontcolor": "#333333",
            "penwidth": "2",
        },
    ):
        edge_sec = Rack(
            "Edge security + rate limiting\nCSP / HSTS / X-Frame-Options\nproxy.ts session check"
        )
        app_router = Blank(
            "Next.js 16 App Router\nPages + API routes + Server Actions\nauth() + Zod + CSRF on all routes"
        )
        edge_sec >> Edge(**REQUEST) >> app_router

    # ---- Security / identity boundary ----
    with Cluster(
        "Identity Boundary — Security Pillar\nOIDC federation · zero long-lived keys",
        graph_attr={
            "bgcolor": "#fff5f5",
            "style": "rounded,dashed",
            "color": "#9b2c2c",
            "fontcolor": "#742a2a",
            "penwidth": "2",
        },
    ):
        sts = STS("AWS STS (OIDC)\nVercel OIDC → temporary\nscoped credentials")
        cognito = Cognito("Cognito User Pool\nsignup / verify / MFA-ready")

    # ---- AWS workload (Reliability + Security: least-privilege resources) ----
    with Cluster(
        "AWS (eu-west-1) — Reliability Pillar\nscoped, least-privilege resource access",
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
        clip_pipeline = Blank("AI highlight scoring\n(async, post-upload)")

    # ---- External APIs (downstream, rightmost) ----
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
        paystack = Blank("Paystack\n(Checkout + Webhooks)")
        gemini = Blank("Google AI\n(gemini-3.5-flash)")
        resend = Blank("Resend\n(magic link email)")

    # ---- Observability (Operational Excellence) — own row, below everything ----
    with Cluster(
        "Observability — Operational Excellence",
        graph_attr={
            "bgcolor": "#f0fff4",
            "style": "rounded,dotted",
            "color": "#2f855a",
            "fontcolor": "#22543d",
            "penwidth": "1.5",
        },
    ):
        monitoring = Cloudwatch("CloudWatch\nlogs · metrics · alarms")

    # ===== Request path (solid / blue) =====
    browser >> Edge(label="HTTPS/TLS", **REQUEST) >> edge_sec
    app_router >> Edge(label="assume role", **TRUST) >> sts
    app_router >> Edge(label="verify session", **REQUEST) >> cognito
    sts >> Edge(label="scoped creds", **TRUST) >> dynamo
    sts >> Edge(label="scoped creds", **TRUST) >> s3

    # ===== Async / event paths (dashed / orange) =====
    app_router >> Edge(label="enqueue", **ASYNC) >> clip_pipeline
    clip_pipeline >> Edge(label="score request", **ASYNC) >> gemini
    app_router >> Edge(label="magic link", **ASYNC) >> resend
    app_router >> Edge(label="webhook", **ASYNC) >> paystack
    paystack >> Edge(label="event callback", **ASYNC) >> app_router

    # ===== Telemetry (dotted / grey) =====
    app_router >> Edge(**TELEMETRY) >> monitoring
    dynamo >> Edge(**TELEMETRY) >> monitoring
    s3 >> Edge(**TELEMETRY) >> monitoring
    clip_pipeline >> Edge(**TELEMETRY) >> monitoring