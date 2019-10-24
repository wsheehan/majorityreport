use Mix.Config

config :majority_report_api, ecto_repos: [MajorityReportApi.Repo]

import_config "#{Mix.env()}.exs"