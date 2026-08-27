output "next_steps" {
  description = "What to do after `terraform apply` finishes"
  value       = <<-EOT

    Platform components installed. Next steps:

    1. Wait for pods to be ready:
         kubectl get pods -n argocd
         kubectl get pods -n monitoring

    2. Get the ArgoCD admin password:
         kubectl -n argocd get secret argocd-initial-admin-secret \
           -o jsonpath="{.data.password}" | base64 -d

    3. Port-forward the ArgoCD UI (https://localhost:8080, user "admin"):
         kubectl -n argocd port-forward svc/argocd-server 8080:443

    4. Point ArgoCD at this repo's app manifests:
         kubectl apply -f ../argocd/application.yaml

    5. Port-forward Grafana (http://localhost:3000, user "admin" / the
       grafana_admin_password variable you set, default "temple-admin"):
         kubectl -n monitoring port-forward svc/prometheus-grafana 3000:80

    Full walkthrough, including minikube setup and what to check once
    everything is running, is in the README's Kubernetes section.
  EOT
}

output "argocd_namespace" {
  value = kubernetes_namespace.argocd.metadata[0].name
}

output "monitoring_namespace" {
  value = kubernetes_namespace.monitoring.metadata[0].name
}
