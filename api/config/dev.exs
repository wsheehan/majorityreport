use Mix.Config

config :majority_report_api, MajorityReportApi.Repo,
  database: "majority_report_api_repo",
  username: "postgres",
  hostname: "localhost"