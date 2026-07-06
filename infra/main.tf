terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ── Data ────────────────────────────────────────────────
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

# ── Key Pair ─────────────────────────────────────────────
resource "aws_key_pair" "this" {
  key_name   = "${var.app_name}-key"
  public_key = file(var.ssh_public_key_path)
}

# ── Security Group ───────────────────────────────────────
resource "aws_security_group" "this" {
  name        = "${var.app_name}-sg"
  description = "TamLezzet ERP security group"

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_allowed_cidr]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = local.tags
}

# ── EC2 Instance ─────────────────────────────────────────
resource "aws_instance" "this" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.this.key_name
  vpc_security_group_ids = [aws_security_group.this.id]

  root_block_device {
    volume_size = var.root_volume_gb
    volume_type = "gp3"
    encrypted   = true
  }

  user_data = templatefile("${path.module}/user_data.sh", {
    repo_url     = var.repo_url
    app_domain   = var.app_domain
    db_username  = var.db_username
    db_password  = var.db_password
    jwt_secret   = var.jwt_secret
    cors_origins = var.app_domain != "" ? "https://${var.app_domain}" : "*"
  })

  tags = merge(local.tags, { Name = var.app_name })
}

# ── Elastic IP ───────────────────────────────────────────
resource "aws_eip" "this" {
  instance = aws_instance.this.id
  domain   = "vpc"
  tags     = local.tags
}

# ── Locals ───────────────────────────────────────────────
locals {
  tags = {
    Project     = var.app_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
