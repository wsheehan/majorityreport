defmodule MajorityReportApi.MarketController do
  import Ecto.Query

  alias MajorityReportApi.Repo
  alias MajorityReportApi.Market
  alias MajorityReportApi.Precedent

  def get(%{path_params: path_params}) do
    query = from p in Precedent, 
      select: map(p, [:description, :id, :name])

    case Repo.get(Market, path_params["id"]) |> Repo.preload([precedents: query]) do
      nil -> %{}
      m -> Map.take(m, [:id, :precedents])
    end
  end
end