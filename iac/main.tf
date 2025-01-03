provider "aws" {
  region = "us-east-1"
}

terraform {
  backend "s3" {
    bucket         = "zotlease-tf-state"
    key            = "terraform/state"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}

# Custom DB Parameter Group for PostgreSQL 16.3
resource "aws_db_parameter_group" "custom_postgres16" {
  name        = "custom-postgres16"
  family      = "postgres16"
  description = "Custom parameter group for PostgreSQL 16.3"
}

# Generate a random password for the RDS instance
resource "random_password" "db_password" {
  length  = 16
  special = true
}

# RDS PostgreSQL Database
resource "aws_db_instance" "zotlease_db" {
  allocated_storage    = 20
  engine               = "postgres"
  engine_version       = "16.3"
  instance_class       = "db.t3.micro"
  identifier           = "zotlease"
  username             = "zotlease_admin"
  password             = random_password.db_password.result
  parameter_group_name = aws_db_parameter_group.custom_postgres16.name
  skip_final_snapshot  = true
}

# Store DB connection details in Secrets Manager
resource "aws_secretsmanager_secret" "db_connection_details" {
  name = "zotlease-db-connection"
}

resource "aws_secretsmanager_secret_version" "db_connection_details_version" {
  secret_id     = aws_secretsmanager_secret.db_connection_details.id
  secret_string = jsonencode({
    db_host     = aws_db_instance.zotlease_db.address
    db_port     = aws_db_instance.zotlease_db.port
    db_user     = "zotlease_admin"
    db_password = random_password.db_password.result
  })
}

# S3 Bucket
resource "aws_s3_bucket" "zotlease_bucket" {
  bucket = "zotlease-photoupload"
  acl    = "private"
}

# ECR Repositories
resource "aws_ecr_repository" "api_repo" {
  name = "zotlease/api"
}

resource "aws_ecr_repository" "frontend_repo" {
  name = "zotlease/frontend"
}

# Secrets Manager Secret for PostgreSQL Admin User
resource "random_password" "db_admin_password" {
  length  = 16
  special = true
}

# resource "aws_secretsmanager_secret" "db_admin_secret" {
#   name = "zotlease-db-admin"
# }

# resource "aws_secretsmanager_secret_version" "db_admin_secret_version" {
#   secret_id     = aws_secretsmanager_secret.db_admin_secret.id
#   secret_string = jsonencode({
#     username = "zotlease_admin"
#     password = random_password.db_admin_password.result
#   })
# }

# # PostgreSQL Admin User Creation
# resource "db_admin_user_resource" "create_db_admin_user" {
#   depends_on = [aws_db_instance.zotlease_db]

#   provisioner "local-exec" {
#     command = <<EOT
#       PGPASSWORD='${random_password.db_password.result}' psql -h ${aws_db_instance.zotlease_db.address} -U zotlease_admin -d ${aws_db_instance.zotlease_db.identifier} -c "CREATE USER admin WITH PASSWORD '${random_password.db_admin_password.result}';"
#       PGPASSWORD='${random_password.db_password.result}' psql -h ${aws_db_instance.zotlease_db.address} -U zotlease_admin -d ${aws_db_instance.zotlease_db.identifier} -c "GRANT ALL PRIVILEGES ON DATABASE ${aws_db_instance.zotlease_db.identifier} TO admin;"
#     EOT
#   }
# }