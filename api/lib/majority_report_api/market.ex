defmodule MajorityReportApi.Market do
  use Ecto.Schema

  @primary_key {:id, :string, []}

  schema "markets" do
    field :description, :string
    many_to_many :precedents, MajorityReportApi.Precedent, join_through: "precedents_markets"
  end
end