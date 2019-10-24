defmodule MajorityReportApi.Application do
  use Application

  def start(_type, _args) do
    children = [
      MajorityReportApi.Repo,
      MajorityReportApi.Endpoint
    ]

    opts = [strategy: :one_for_one, name: MajorityReportApi.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
