defmodule MajorityReportApi.Precedent do
  use Ecto.Schema

  schema "precedents" do
    field :description, :string
    field :name, :string
    many_to_many :markets, MajorityReportApi.Market, join_through: "precedents_markets"
  end
end