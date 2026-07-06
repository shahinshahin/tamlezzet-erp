output "public_ip" {
  description = "Elastic IP of the EC2 instance"
  value       = aws_eip.this.public_ip
}

output "public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = aws_instance.this.public_dns
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i ~/.ssh/id_rsa ec2-user@${aws_eip.this.public_ip}"
}

output "app_url" {
  description = "Application URL"
  value       = "https://${var.app_domain}"
}
