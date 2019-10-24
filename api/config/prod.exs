use Mix.Config

config :majority_report_api, MajorityReportApi.Repo,
  ssl: true,
  url: System.get_env("DATABASE_URL"),
  pool_size: 15
