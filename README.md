# Sri Lakshmi Venkateswara Temple — Website & Admin Platform

A full-stack website for Sri Lakshmi Venkateswara Temple, built as a real,
deployable project **and** a hands-on tour of the modern DevOps toolchain:
Linux, Git/GitHub, Docker, Kubernetes, Terraform, Python, CI/CD with GitHub
Actions, GitOps with Argo CD, monitoring with Prometheus/Grafana, and
DevSecOps scanning (gitleaks, Dependabot, Trivy, CodeQL, Checkov, hadolint).

The project intentionally runs on two tracks (see the "Two deployment
tracks" section below):

- A simple **Docker + GitHub Actions + free-tier hosting** path that puts the
  actual temple website live on the internet for devotees to use.
- A **Kubernetes + Terraform + Argo CD + Prometheus** learning environment on
  a local minikube cluster, where you practice the full GitOps loop without
  any cloud bill risk.

## What's included

- **Public website**: Home, About, Events calendar, Photo gallery, Online
  donations (Razorpay), Book-a-Priest home seva requests, Contact.
- **Admin dashboard**: password-protected area for temple staff to manage
  events, gallery photos, donation records, and priest bookings — no code
  changes needed.
- **Backend API**: Node.js + Express + MongoDB, with JWT-based admin auth and
  Prometheus metrics.
- **Booking microservice**: a separate **Python (FastAPI)** service that
  handles priest/home-seva booking requests, sharing the Node backend's admin
  JWT so one login works across both services — a small, realistic example of
  a polyglot microservice architecture.
- **Containerization**: a `Dockerfile` for each of the three services
  (multi-stage build for the frontend, served by nginx), plus a
  `docker-compose.yml` that runs the whole stack (including MongoDB) locally
  with one command.
- **CI/CD**: GitHub Actions workflows that lint/test/build every push and
  pull request (Node, Python, and the Kubernetes manifests themselves), build
  and publish Docker images, and update the Kubernetes manifests so Argo CD
  can pick up the new version.
- **Kubernetes manifests** (`k8s/`, a Kustomize base) for all four workloads
  (mongo, backend, booking-service, frontend) plus an Ingress and
  Prometheus `ServiceMonitor`s.
- **Terraform** (`terraform/`) that bootstraps the platform layer of a local
  minikube cluster: installs Argo CD and the kube-prometheus-stack
  (Prometheus + Grafana + Alertmanager) via Helm.
- **Argo CD Application** (`argocd/application.yaml`) that continuously syncs
  the `k8s/` manifests from this git repo into the cluster — the actual GitOps
  loop.
- **DevSecOps**: secret scanning (gitleaks), dependency scanning (Dependabot,
  `npm audit`, `pip-audit`), container image scanning (Trivy), static
  application security testing (GitHub CodeQL), infrastructure-as-code
  scanning (Checkov) and Dockerfile linting (hadolint) — all report-only,
  wired into GitHub Actions and the Security tab. Plus Kubernetes hardening:
  non-root/read-only-filesystem containers, dedicated least-privilege
  ServiceAccounts, and default-deny NetworkPolicies. See the "DevSecOps"
  section below.

## Project structure

```
shree-lakshmi-venkateswara-temple/
├── backend/                  Express API (Node.js + MongoDB)
│   ├── src/
│   │   ├── models/           Mongoose schemas: Admin, Event, GalleryImage, Donation
│   │   ├── routes/           auth, events, gallery, donations
│   │   ├── middleware/       JWT auth guard, error handler
│   │   ├── metrics.js         Prometheus metrics (/metrics)
│   │   ├── seed.js           Creates the first admin account + sample data
│   │   └── server.js         Entry point
│   ├── Dockerfile
│   └── .env.example
├── booking-service/           Python (FastAPI) microservice - priest/seva bookings
│   ├── app/
│   │   ├── routes/bookings.py
│   │   ├── auth.py            Verifies the SAME JWT the Node backend issues
│   │   ├── main.py            App wiring + /metrics (Prometheus)
│   │   └── config.py
│   ├── tests/
│   ├── Dockerfile
│   └── .env.example
├── frontend/                  React (Vite) site + admin dashboard
│   ├── src/
│   │   ├── pages/             Home, About, Events, Gallery, Donate, BookPriest, Contact, Admin*
│   │   └── components/
│   ├── Dockerfile              Multi-stage build -> served by nginx
│   ├── nginx.conf              Also proxies /booking-api/ to booking-service
│   └── .env.example
├── docker-compose.yml         Runs mongo + backend + booking-service + frontend locally
├── k8s/                        Kubernetes manifests (Kustomize base)
│   ├── namespace.yaml, configmap.yaml, secret.example.yaml
│   ├── networkpolicy-default-deny.yaml   Deny-all-ingress baseline for the temple namespace
│   ├── mongo/, backend/, booking-service/, frontend/
│   │   Deployment (hardened securityContext) + Service (+ ServiceMonitor)
│   │   + serviceaccount.yaml + networkpolicy.yaml (explicit allows)
│   ├── ingress.yaml
│   └── kustomization.yaml      Image tags updated automatically by cd.yml
├── terraform/                  Bootstraps the minikube platform layer (Argo CD, Prometheus/Grafana)
│   ├── main.tf, variables.tf, outputs.tf, versions.tf
├── argocd/
│   └── application.yaml        Points Argo CD at this repo's k8s/ directory
└── .github/
    ├── workflows/
    │   ├── ci.yml               Lint + test (Node & Python) + build + validate k8s manifests
    │   ├── cd.yml               Build & push Docker images, update k8s image tags, optional deploy hook
    │   ├── security.yml         Secret/dependency/container/IaC scanning + Dockerfile lint (report-only)
    │   └── codeql.yml           SAST for the JS/TS and Python source (report-only)
    └── dependabot.yml           Weekly dependency-update PRs (npm, pip, Docker base images, Actions, Terraform)
```

## Prerequisites

For the website itself (Docker Compose track):

- [Node.js 20 LTS](https://nodejs.org/) and npm (for running things without Docker)
- [Python 3.12](https://www.python.org/) (for the booking-service without Docker)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for the containerized workflow)
- A free [GitHub](https://github.com) account (for CI/CD)
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) account (for a production database — a local Docker Mongo is used for development)
- A [Razorpay](https://razorpay.com) account (for real online donations — optional while developing, using test keys)

Additionally, for the Kubernetes/GitOps/monitoring learning track (see that
section below):

- [minikube](https://minikube.sigs.k8s.io/) and `kubectl`
- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.5
- [Helm](https://helm.sh/) (used indirectly, via Terraform's Helm provider)
- `kustomize` (or a recent `kubectl`, which bundles it as `kubectl kustomize`)

## Option A: Run everything with Docker (recommended)

This is the closest thing to "production" you can run on your own laptop, and
is a great way to actually practice Docker.

```bash
# from the project root
cp backend/.env.example backend/.env
# edit backend/.env if you want, then:
docker compose up --build
```

This starts four containers:

- `temple-mongo` — MongoDB, with data persisted in a Docker volume
- `temple-backend` — the Node API, on http://localhost:5000
- `temple-booking-service` — the Python booking API, on http://localhost:8000
- `temple-frontend` — the website, on **http://localhost:8080**

Open **http://localhost:8080** in your browser.

The first time, create the admin account and sample data by running the seed
script inside the backend container:

```bash
docker compose exec backend npm run seed
```

This creates an admin login using `ADMIN_EMAIL` / `ADMIN_PASSWORD` from
`backend/.env` (defaults are in `.env.example` — **change the password**).
Log in at http://localhost:8080/admin/login.

Stop everything with `docker compose down` (add `-v` to also wipe the database volume).

## Option B: Run without Docker (faster iteration while coding)

Terminal 1 — backend:

```bash
cd backend
cp .env.example .env
# Set MONGO_URI to a local MongoDB, or use a free MongoDB Atlas cluster (see below)
npm install
npm run seed   # first time only: creates the admin account + sample data
npm run dev
```

Terminal 2 — booking-service:

```bash
cd booking-service
cp .env.example .env
python3 -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000
```

Terminal 3 — frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Visit http://localhost:5173. The Vite dev server proxies `/api` and
`/booking-api` requests to the two backends automatically (see
`frontend/vite.config.js`).

If you don't want to install MongoDB locally, the quickest option is a free
[MongoDB Atlas](https://www.mongodb.com/atlas) M0 cluster — create one, get
its connection string, and paste it into `backend/.env` as `MONGO_URI`.

## Running tests & lint

```bash
cd backend && npm test && npm run lint
cd booking-service && pytest -v && ruff check app tests
cd frontend && npm run lint && npm run build
```

These are exactly the checks the CI pipeline runs on every push.

## Environment variables

See each service's `.env.example` for the full list with comments. The
important ones:

| Variable | Where | Purpose |
|---|---|---|
| `MONGO_URI` | backend, booking-service | MongoDB connection string (different database name for each service) |
| `JWT_SECRET` | backend, booking-service | **Must be identical in both services** — signs/verifies admin login tokens. Use a long random value in production. |
| `CORS_ORIGIN` | backend, booking-service | Comma-separated list of frontend origins allowed to call the API |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | backend | Payment gateway credentials — get from the Razorpay dashboard |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | backend | Used once by `npm run seed` to create the first admin account |
| `VITE_API_URL` | frontend | Base URL the frontend uses to call the Node API (`/api` when nginx or the Vite proxy handles routing) |
| `VITE_BOOKING_API_URL` | frontend | Base URL the frontend uses to call the booking-service (`/booking-api`) |

**Never commit `.env` files** — they're already excluded via `.gitignore`.
Only `.env.example` files (with placeholder values) are committed.

## Setting up real online donations (Razorpay)

1. Create a account at [dashboard.razorpay.com](https://dashboard.razorpay.com).
2. While in **Test Mode**, go to *Settings → API Keys* and generate a test key pair.
3. Put them in `backend/.env` as `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` and
   test a donation end-to-end using Razorpay's [test card numbers](https://razorpay.com/docs/payments/payments/test-card-upi-details/).
4. Once the temple has completed Razorpay's KYC/activation, switch to **Live
   Mode** keys and update the same environment variables in production.

## How the CI/CD pipeline works

- **`.github/workflows/ci.yml`** runs on every push and pull request to
  `main`, as four parallel jobs:
  - lint + test the Node backend (Jest)
  - lint + test the Python booking-service (ruff + pytest)
  - lint + build the React frontend
  - render `k8s/` with `kustomize build` and validate every resulting
    manifest against the real Kubernetes (and Prometheus Operator CRD)
    schemas with `kubeconform` — this catches a typo'd field or a bad
    reference *before* Argo CD ever tries to apply it to your cluster.
  This is your safety net — it catches broken code before it reaches
  production or your learning cluster.
- **`.github/workflows/cd.yml`** runs on every push to `main`:
  1. Builds Docker images for `backend`, `booking-service`, and `frontend`
     and pushes them to the **GitHub Container Registry** (`ghcr.io`), tagged
     with both `latest` and the commit SHA.
  2. Optionally calls a deploy hook URL (see below) so Render picks up the
     new image automatically — this is what keeps the *live* site current.
  3. Updates `k8s/kustomization.yaml`'s image tags to point at the images
     just built, and commits that change back to `main` (with `[skip ci]` so
     it doesn't trigger itself again). This is what Argo CD is watching for
     — see the next section.

To use this, just push to `main` on GitHub — no extra setup is required for
the image build/push step (it uses the automatically-provided
`GITHUB_TOKEN`). The Render deploy step is optional and controlled by repo
secrets; the Kubernetes manifest update always runs.

## Two deployment tracks

This project deliberately keeps two separate paths, rather than forcing
Kubernetes onto the actual live site or forcing Render into your learning
loop:

1. **The live site** (this section, below): Docker images pushed to GHCR,
   deployed to Render's free tier + MongoDB Atlas. This is what devotees
   actually use.
2. **The Kubernetes/GitOps/monitoring learning environment** (next section):
   the same three Docker images, deployed to a local minikube cluster via
   Terraform + Argo CD, with Prometheus/Grafana watching them. This is purely
   for practicing the tools — nothing here needs to be "production-grade" or
   cost you anything.

Both tracks build and use the *exact same* Docker images and application
code — only the deployment mechanism differs.

## Deploying to a real, live URL (free tier)

This project is designed to deploy on free tiers of [Render](https://render.com)
(hosting) and [MongoDB Atlas](https://www.mongodb.com/atlas) (database) — no
credit card charges for a small temple site's traffic level. Provider free
tiers change over time, so double-check current limits on each provider's
pricing page before you commit to it.

1. **Push this project to a new GitHub repository.**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: temple website"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```

2. **Create a MongoDB Atlas free (M0) cluster.**
   - Sign up at mongodb.com/atlas, create a free M0 cluster.
   - Under *Database Access*, create a database user + password.
   - Under *Network Access*, allow access from anywhere (`0.0.0.0/0`) — fine
     for a small site; Atlas still requires the correct username/password.
   - Copy the connection string (`mongodb+srv://...`).

3. **Deploy the backend on Render as a Web Service.**
   - New → Web Service → connect your GitHub repo → set **Root Directory** to `backend`.
   - Render will detect the `Dockerfile` and build from it automatically
     (or choose "Docker" as the environment explicitly).
   - Add environment variables in Render's dashboard: `MONGO_URI` (from step
     2), `JWT_SECRET`, `CORS_ORIGIN` (your frontend's Render URL, once you have it),
     `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
   - After the first deploy succeeds, open a shell for the service (or run a
     one-off job) and run `npm run seed` to create the admin account.
   - Copy the backend's public URL, e.g. `https://temple-backend.onrender.com`.

4. **Deploy the booking-service on Render as a second Web Service**, the same
   way: Root Directory `booking-service`, Render detects its `Dockerfile`.
   Set `MONGO_URI` (a different database name, e.g. `.../temple_bookings`),
   `JWT_SECRET` (**the same value** as the backend's), and `CORS_ORIGIN`.
   Copy its public URL too, e.g. `https://temple-booking.onrender.com`. If you
   skip this step, everything else on the site still works — only the "Book a
   Priest" page won't be able to submit requests.

6. **Deploy the frontend on Render as a Static Site or a second Web Service.**
   - Simplest: New → Static Site → Root Directory `frontend`, build command
     `npm run build`, publish directory `dist`. Set `VITE_API_URL` and
     `VITE_BOOKING_API_URL` to the backend's and booking-service's public
     URLs from steps 3 and 4 as build-time environment variables.
   - Or, to keep using the provided Dockerfile/nginx setup instead, deploy it
     as a second Web Service (Docker) and update `nginx.conf`'s two
     `proxy_pass` lines to point at the backend's and booking-service's
     public Render URLs instead of the Docker service names `backend` /
     `booking-service`.

7. **(Optional) Wire up automatic deploys from CD.** In Render, each service
   has a *Deploy Hook* URL under Settings. Add it to your GitHub repo as a
   secret named `RENDER_BACKEND_DEPLOY_HOOK` / `RENDER_FRONTEND_DEPLOY_HOOK`
   (Settings → Secrets and variables → Actions) — add a
   `RENDER_BOOKING_DEPLOY_HOOK` too if you also want to extend `cd.yml`'s
   deploy job for the booking-service. From then on, every push to `main`
   will automatically trigger a redeploy after the CI checks and image build
   succeed.

8. **Point your domain at it.** Once you have a domain for the temple, add it
   as a Custom Domain on the frontend service in Render and follow their DNS
   instructions (usually a `CNAME` record).

## Kubernetes, GitOps & Monitoring (learning environment on minikube)

This is the second deployment track from above: a local Kubernetes cluster
where you practice Terraform, Kubernetes, Argo CD (GitOps), and Prometheus/
Grafana (monitoring) — entirely free, entirely on your own laptop.

**The full loop, once set up:** you push code → GitHub Actions' CI lints,
tests, and validates the Kubernetes manifests → CD builds Docker images and
updates `k8s/kustomization.yaml` with the new image tags → Argo CD notices
that git change and automatically applies it to the cluster → Prometheus
scrapes the new pods' `/metrics` endpoints → you watch it all happen in the
Argo CD and Grafana UIs.

### 1. Start minikube and enable addons

```bash
minikube start --cpus=4 --memory=6g
minikube addons enable ingress
minikube addons enable metrics-server
```

(Lower `--cpus`/`--memory` if your laptop doesn't have room — everything here
also runs fine with less, just slower to schedule.)

### 2. Bootstrap the platform with Terraform

```bash
cd terraform
terraform init
terraform apply
```

This installs Argo CD (into the `argocd` namespace) and the
kube-prometheus-stack — Prometheus, Grafana, and Alertmanager — (into the
`monitoring` namespace) via Helm. It deliberately does **not** touch the
`temple` application namespace — that belongs to Argo CD, set up next.

When it finishes, `terraform output next_steps` prints the commands below
again for reference.

### 3. Create the application secret (once, manually — never in git)

```bash
kubectl create namespace temple
kubectl create secret generic temple-secrets -n temple \
  --from-literal=JWT_SECRET="$(openssl rand -hex 32)" \
  --from-literal=RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx \
  --from-literal=RAZORPAY_KEY_SECRET=your_test_key_secret \
  --from-literal=ADMIN_EMAIL=admin@srilakshmivenkateswara.org \
  --from-literal=ADMIN_PASSWORD=change-me-immediately
```

See `k8s/secret.example.yaml` for the full field reference and why this isn't
committed to git.

### 4. Point this repo's own fork/copy at the images

Push this project to your own GitHub repo (see step 1 of the deployment
section above, if you haven't already), then update the placeholders:

```bash
cd k8s
kustomize edit set image temple-backend=ghcr.io/<you>/<repo>-backend:latest
kustomize edit set image temple-booking-service=ghcr.io/<you>/<repo>-booking-service:latest
kustomize edit set image temple-frontend=ghcr.io/<you>/<repo>-frontend:latest
```

Also edit `argocd/application.yaml`'s `spec.source.repoURL` to your repo's
URL, and commit + push all of this. Once you push to `main`, `cd.yml` will
build the images and keep these tags current automatically from then on.

### 5. Tell Argo CD to sync this repo

```bash
kubectl apply -f argocd/application.yaml
```

Argo CD will now create everything in `k8s/` inside the `temple` namespace,
and keep re-applying it (`selfHeal: true`) if it ever drifts from git.

### 6. Watch it come up

```bash
kubectl get pods -n temple -w
```

Once pods are `Running`, get to the site itself: add `minikube ip` to your
hosts file as `temple.local` (`sudo sh -c 'echo "$(minikube ip) temple.local" >> /etc/hosts'`
on macOS/Linux; edit `C:\Windows\System32\drivers\etc\hosts` as Administrator
on Windows), then visit **http://temple.local**.

### 7. Explore the Argo CD and Grafana UIs

```bash
# Argo CD - https://localhost:8080, user "admin"
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
kubectl -n argocd port-forward svc/argocd-server 8080:443

# Grafana - http://localhost:3000, user "admin" / grafana_admin_password (default "temple-admin")
kubectl -n monitoring port-forward svc/prometheus-grafana 3000:80
```

In Argo CD you should see the `temple` Application, synced and healthy, with
a visual graph of every resource it's managing. In Grafana, import one of the
built-in Kubernetes dashboards (or build your own) and you'll see the
backend's and booking-service's request-rate/latency metrics flowing in —
confirm the raw scrape by checking Prometheus's *Status → Targets* page
(`kubectl -n monitoring port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090`)
for `serviceMonitor/temple/backend` and `serviceMonitor/temple/booking-service`
both showing "UP".

### 8. See the GitOps loop close

Make any small change (e.g. tweak `frontend/src/pages/Home.jsx`) and push to
`main`. Watch: CI runs → CD builds new images and pushes a
`chore(gitops): deploy <sha>` commit → within Argo CD's default 3-minute poll
(or click "Refresh" to force it) the Application shows `OutOfSync` and then
auto-syncs → new pods roll out → Grafana's request graphs briefly dip during
the rollout and recover.

### Troubleshooting

- **Pods stuck in `CrashLoopBackOff` for backend/booking-service**: almost
  always the `temple-secrets` Secret from step 3 doesn't exist yet, or
  `JWT_SECRET` differs between it and what the app expects.
- **`ImagePullBackOff`**: the image name/tag in `k8s/kustomization.yaml`
  doesn't exist yet on GHCR — either you haven't pushed to `main` yet (so
  `cd.yml` hasn't built anything), or your GitHub Container Registry package
  visibility is private and the cluster has no pull credentials (make the
  packages public under your GitHub profile's Packages tab, or add an
  `imagePullSecrets` — out of scope for this local learning setup).
- **Argo CD shows the Application as `Unknown`/erroring on `ServiceMonitor`**:
  the kube-prometheus-stack CRDs from `terraform apply` haven't finished
  installing yet — wait a minute and hit Refresh.

### Cleaning up

```bash
kubectl delete -f argocd/application.yaml   # removes everything Argo CD deployed
cd terraform && terraform destroy
minikube delete
```

## DevSecOps: security scanning & hardening

Security isn't a separate step bolted on at the end here — it's wired into
the same CI/CD pipeline and the same Kubernetes manifests as everything
else. This section covers two things: the automated scanning in
`.github/workflows/security.yml` and `.github/workflows/codeql.yml`, and the
hardening baked into the `k8s/` manifests themselves.

### Report-only, by design

Every scanner below is configured to **never fail the build**
(`continue-on-error: true`, `|| true`, `exit-code: "0"`, or `--soft-fail`,
depending on the tool). Findings still get uploaded as SARIF and show up in
this repo's **Security → Code scanning alerts** tab, so nothing is hidden —
but a real CVE in a base image or a checkov warning about a learning-cluster
shortcut won't block you from merging or shipping. This is a deliberate
choice for a project you're actively learning from: turn any job's
soft-fail flag off (or add a `severity`/threshold check) once you want it to
gate merges instead.

### The scanners

| Tool | Catches | Where it runs | Results |
|---|---|---|---|
| **gitleaks** | Secrets (API keys, tokens, passwords) committed to git, including in past commits | `security.yml` → `secret-scan` | Security tab, category `gitleaks` |
| **Dependabot** | Outdated/vulnerable dependencies across npm, pip, Docker base images, GitHub Actions, and Terraform providers | Runs on its own weekly schedule, no CI job needed | Automatic PRs against `main` |
| **`npm audit` / `pip-audit`** | Known CVEs in the currently-installed dependency tree (catches things between Dependabot's weekly runs) | `security.yml` → `dependency-audit` | Job log output |
| **Trivy** | OS package and language-dependency vulnerabilities inside each built container image | `security.yml` → `container-scan` (matrix: backend, booking-service, frontend) | Security tab, category `trivy-<service>` |
| **CodeQL** | Application-level bugs with security impact — injection, broken auth checks, unsafe deserialization, etc. — in the actual source code | `codeql.yml` (matrix: javascript-typescript, python) | Security tab, category `/language:<lang>` |
| **Checkov** | Misconfigurations in the Kubernetes manifests and Terraform (missing security contexts, overly-permissive settings, etc.) | `security.yml` → `iac-scan` | Security tab, categories `checkov-k8s` / `checkov-terraform` |
| **hadolint** | Dockerfile anti-patterns (unpinned base images, missing `USER`, shell-form `CMD`, etc.) | `security.yml` → `dockerfile-lint` (matrix over all 3 Dockerfiles) | Security tab, category `hadolint-<service>` |

All of the `security.yml` jobs and `codeql.yml` also run on a weekly cron
(Monday mornings), so newly-disclosed CVEs against unchanged code still get
caught.

### Kubernetes hardening

Every Deployment in `k8s/` (mongo, backend, booking-service, frontend) now
has:

- **Non-root, restricted containers**: `runAsNonRoot: true` with an explicit
  `runAsUser`/`runAsGroup`, `allowPrivilegeEscalation: false`,
  `capabilities: {drop: ["ALL"]}`, and a `seccompProfile` of
  `RuntimeDefault`. The frontend's nginx now listens on port 8080 instead of
  80 for the same reason — unprivileged users can't bind ports below 1024
  (see `frontend/nginx.conf` and `frontend/Dockerfile`).
- **Read-only root filesystems** (`readOnlyRootFilesystem: true`) for
  backend, booking-service, and frontend, each with a small `emptyDir`
  mounted wherever the app or its runtime needs to write (`/tmp`, plus
  nginx's cache/run directories for the frontend). Mongo is the one
  exception — see below.
- **Dedicated ServiceAccounts** (`serviceaccount.yaml` per service) instead
  of the namespace's `default` one, each with
  `automountServiceAccountToken: false` since none of these workloads talk
  to the Kubernetes API.
- **Default-deny NetworkPolicies**: `networkpolicy-default-deny.yaml`
  blocks all ingress traffic in the `temple` namespace by default, and each
  service's own `networkpolicy.yaml` explicitly allow-lists only the
  traffic it actually needs — e.g. mongo only accepts connections from the
  backend and booking-service pods, and the frontend only accepts them from
  the ingress controller.

### Checkov findings we've accepted (and why)

Running `checkov --directory k8s --framework kubernetes` against this repo
evaluates 374 checks: 360 pass, 1 is explicitly skipped (see `CKV_K8S_22`
below), and 13 fail. All 13 are deliberate, documented trade-offs for a
learning/portfolio project rather than bugs:

- **`CKV_K8S_14` "Image Tag should be fixed - not latest or blank"** (backend,
  booking-service, frontend) — these use the symbolic `temple-*` image names
  that Kustomize rewrites to a real, immutable tag (the git SHA) at CI time;
  see `k8s/kustomization.yaml`. The placeholder itself has no tag to pin.
- **`CKV_K8S_43` "Image should use digest"** (all four services) — the CI
  pipeline currently tags images by git SHA, not by resolving and pinning a
  content digest. Documented as a roadmap item below; would need `cd.yml` to
  capture each build's digest and write it into `kustomization.yaml`.
- **`CKV_K8S_40` "Containers should run as a high UID"** (all four services)
  — each container runs as its base image's standard non-root user (nginx's
  `101`, mongo's `999`, and `1000` for the Node/Python images), not a
  purpose-picked high UID. Rebuilding each image with a custom high-UID user
  would fix this, but was left as-is to keep the Dockerfiles close to each
  ecosystem's normal convention.
- **`CKV_K8S_35` "Prefer secrets as files over environment variables"**
  (backend, booking-service) — both apps currently read `JWT_SECRET` and
  friends via `process.env`/`pydantic-settings` env vars, matching how they
  also run in plain Docker Compose. Switching to mounted secret files would
  mean maintaining two different config-loading paths for the two
  deployment tracks, so it's deferred.
- **`CKV_K8S_22` "Use read-only filesystem for containers where possible"**
  (mongo only) — explicitly suppressed via a `checkov.io/skip1` annotation
  on the Deployment (see `k8s/mongo/deployment.yaml`). `mongod` writes
  beyond `/data/db` (its Unix socket, temp files, etc.), so a read-only root
  filesystem isn't workable the way it is for the other three services; a
  real production deployment would use a managed database (Atlas) instead,
  as the "Deploying to a real, live URL" section above already does.

  One note on the mechanics, in case you add your own suppressions later:
  Checkov's Kubernetes scanner only honors skips declared as **resource
  annotations** (`metadata.annotations.checkov.io/skip1:
  CKV_XXX=reason`) — the inline `# checkov:skip=...` YAML-comment convention
  documented for Terraform does *not* work for Kubernetes manifests.

## Security notes before going live

- Change `JWT_SECRET` and `ADMIN_PASSWORD` to strong, unique values — never
  use the example defaults in production. Keep `JWT_SECRET` identical between
  the backend and booking-service, or admin logins won't work across both.
- Keep Razorpay keys, and `JWT_SECRET`, out of git; set them only as
  environment variables on your hosting provider (or, on Kubernetes, in the
  `temple-secrets` Secret created directly in the cluster — see the
  Kubernetes section above).
- Consider adding a second admin account and rotating the password
  periodically; the `Admin` model supports multiple accounts.
- The rate limiter in `backend/src/app.js` gives basic protection against
  brute-forcing the admin login; consider tightening it further for
  production.

## Suggested next steps / roadmap

- Replace the placeholder gallery image URLs with real temple photos (upload
  to a service like Cloudinary or S3, then paste the URL into the admin
  gallery form).
- Fill in real content on the About and Contact pages.
- Add a Panchangam/muhurtham widget or festival calendar integration.
- Add HTTPS enforcement and a Content Security Policy header once you have a
  custom domain.
- Once comfortable with the minikube setup, try pointing the same Terraform +
  Kubernetes manifests at a real managed cluster (GKE/EKS/AKS) — the main
  changes needed are the Ingress class/annotations and swapping the local
  MongoDB Deployment for a managed database.
- Replace the manually-created `temple-secrets` Secret with a proper secrets
  operator (Bitnami Sealed Secrets or External Secrets Operator) so the
  *entire* `k8s/` directory, secrets included, can be safely committed.
- Add a Horizontal Pod Autoscaler for the backend and booking-service, and
  watch it react to load in Grafana.
- Build a custom Grafana dashboard (as JSON, checked into `k8s/` via a
  ConfigMap) for the temple-specific metrics: `temple_donations_total`,
  `temple_donations_amount_total_inr`, and booking request volume.
- Add Alertmanager rules (e.g. "alert if the backend's error rate exceeds 5%
  for 5 minutes") and wire them to Slack or email.
- Have `cd.yml` capture each build's image digest and pin `kustomization.yaml`
  to `image@sha256:...` instead of a mutable tag (resolves Checkov's
  `CKV_K8S_43`).
- Move `JWT_SECRET` and friends from environment variables to mounted secret
  files for backend and booking-service (resolves `CKV_K8S_35`) — would need
  a second config-loading path alongside the current Docker Compose one.
- Turn the DevSecOps scanners from report-only to blocking once you're ready
  (e.g. fail `container-scan` on CRITICAL Trivy findings, or require zero
  gitleaks results) — see the "DevSecOps" section above.
