variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "ap-south-1"
}

variable "app_name" {
  description = "Application name used for resource naming"
  type        = string
  default     = "tamlezzet-erp"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "root_volume_gb" {
  description = "Root EBS volume size in GB"
  type        = number
  default     = 30
}

variable "ssh_public_key_path" {
  description = "Path to your SSH public key file"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

variable "ssh_allowed_cidr" {
  description = "CIDR allowed to SSH (restrict to your IP)"
  type        = string
  default     = "0.0.0.0/0"
}

variable "repo_url" {
  description = "GitHub repo URL"
  type        = string
  default     = "https://github.com/shahinshahin/tamlezzet-erp.git"
}

variable "app_domain" {
  description = "Your domain name (e.g. erp.tamlezzet.com) — leave empty to skip HTTPS"
  type        = string
  default     = ""
}

variable "db_username" {
  description = "PostgreSQL username"
  type        = string
  default     = "admin"
}

variable "db_password" {
  description = "PostgreSQL password"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret (min 64 chars)"
  type        = string
  sensitive   = true
}
