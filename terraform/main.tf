# --- Platform bootstrap for the temple's DevOps learning cluster ---
#
# Deliberate division of responsibility (the actual GitOps lesson here):
#   - Terraform (this directory) provisions PLATFORM infrastructure: the
#     "argocd" and "monitoring" namespaces, and the ArgoCD + Prometheus/
#     Grafana Helm releases into them.
#   - ArgoCD then owns the APPLICATION layer: the "temple" namespace and
#     everything in k8s/ (mongo, backend, booking-service, frontend,
#     Ingress, ServiceMonitors) - see argocd/application.yaml.
#
# Terraform never touches the "temple" namespace or anything inside it, so
# there's no risk of Terraform and ArgoCD fighting over the same resources.

resource "kubernetes_namespace" "argocd" {
  metadata {
    name = "argocd"
  }
}

resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "monitoring"
  }
}

resource "helm_release" "argocd" {
  name       = "argocd"
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  version    = var.argocd_chart_version != "" ? var.argocd_chart_version : null
  namespace  = kubernetes_namespace.argocd.metadata[0].name

  # Keep it light for a local minikube cluster.
  values = [yamlencode({
    server = {
      resources = {
        requests = { cpu = "50m", memory = "128Mi" }
      }
      # ClusterIP + port-forward is simplest for local learning (see README).
      # Switch to a LoadBalancer/Ingress if you want browser access without
      # port-forwarding.
      service = { type = "ClusterIP" }
    }
    controller = {
      resources = {
        requests = { cpu = "100m", memory = "256Mi" }
      }
    }
  })]
}

resource "helm_release" "kube_prometheus_stack" {
  name       = "prometheus"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  version    = var.prometheus_chart_version != "" ? var.prometheus_chart_version : null
  namespace  = kubernetes_namespace.monitoring.metadata[0].name

  # NOTE: serviceMonitorSelector/{}NamespaceSelector below are set to
  # match-everything, so this Prometheus discovers the ServiceMonitors in
  # k8s/backend/ and k8s/booking-service/ (which live in the "temple"
  # namespace) without needing exactly-matching labels. Those ServiceMonitors
  # still carry a "release: prometheus" label as a best-practice convention.
  values = [yamlencode({
    grafana = {
      adminPassword = var.grafana_admin_password
      resources = {
        requests = { cpu = "50m", memory = "128Mi" }
      }
    }
    prometheus = {
      prometheusSpec = {
        resources = {
          requests = { cpu = "100m", memory = "256Mi" }
        }
        # Explicitly allow discovering ServiceMonitors in any namespace
        # (not just "monitoring"), since ours live in "temple".
        serviceMonitorSelectorNilUsesHelmValues = false
        serviceMonitorSelector                  = {}
        serviceMonitorNamespaceSelector          = {}
      }
    }
    alertmanager = {
      enabled = true
    }
  })]
}
