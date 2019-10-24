defmodule MajorityReportApi.Repo do
  use Ecto.Repo,
    otp_app: :majority_report_api,
    adapter: Ecto.Adapters.Postgres

  alias MajorityReportApi.Market
  alias MajorityReportApi.Precedent

  def save_market(market) do
    precedents = Enum.map(market.precedents, &load_precedent/1)

    changeset = %Market{id: market.id}
      |> __MODULE__.preload([:precedents])
      |> Ecto.Changeset.change
      |> Ecto.Changeset.put_assoc(:precedents, precedents)

    __MODULE__.insert!(changeset)
  end

  defp load_precedent(id) do
    __MODULE__.get(Precedent, id)
  end

  def save_precedent(precedent) do
    struct(%Precedent{}, precedent) |> __MODULE__.insert
  end
end
