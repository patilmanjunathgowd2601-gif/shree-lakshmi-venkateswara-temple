variable "kubeconfig_path" {
  description = "Path to your kubeconfig file"
  type        = string
  default     = "~/.kube/config"
}

variable "kube_context" {
  description = "kubeconfig context to use - the minikube context is just called \"minikube\" by default"
  type        = string
  default     = "minikube"
}

variable "grafana_admin_password" {
  description = "Admin password for the Grafana UI installed by kube-prometheus-stack"
  type        = string
  default     = "temple-admin"
  sensitive   = true
}

variable "argocd_chart_version" {
  description = "Pin the argo-cd Helm chart to a specific version (leave blank for latest)"
  type        = string
  default     = ""
}

variable "prometheus_chart_version" {
  description = "Pin the kube-prometheus-stack Helm chart to a specific version (leave blank for latest)"
  type        = string
  default     = ""
}
