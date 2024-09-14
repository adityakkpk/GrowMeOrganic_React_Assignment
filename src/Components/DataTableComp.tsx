import { useState, useEffect, useRef, FormEventHandler } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { OverlayPanel } from "primereact/overlaypanel";
import { Paginator, PaginatorPageChangeEvent } from "primereact/paginator";
import "./style.css";

interface Product {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  image?: string;
  price?: number;
  category?: string;
  quantity?: number;
  inventoryStatus?: string;
  rating?: number;
}

export default function DataTableComp() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(12);
  const [page, setPage] = useState(0);

  const [inputValue, setInputValue] = useState("");

  const op = useRef(null);

  const fetchApiData = async (pageNo: Number | any) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${pageNo}`
      );
      const apiData = await res.json();
      setProducts(apiData.data);
      setLoading(false);
    } catch (error: any) {
      console.log(error);
      setLoading(false);
      setError(error);
    }
  };

  useEffect(() => {
    fetchApiData(1);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (parseInt(inputValue) > 12) {
      setSelectedProducts((prev) => [...prev, ...products]);
    } else {
      setSelectedProducts((prev) => [...prev, ...products.slice(0, parseInt(inputValue))]);
    }
  };

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    setFirst(event.first);
    setRows(event.rows);
    fetchApiData(event.page + 1);
    setPage(event.page + 1);

    // const remainSelected = parseInt(inputValue) - 12 * event.page;
    // console.log(products);
    // const remainProducts = products.slice(0, remainSelected);
    // setSelectedProducts((prev) => [...prev, ...remainProducts]);
    // console.log(remainProducts);
  };

  useEffect(() => {
    const remainSelected = parseInt(inputValue) - 12 * page;
    const remainProducts = products.slice(0, remainSelected);
    setSelectedProducts((prev) => [...prev, ...remainProducts]);
  }, [first, products]);
  

  const handleSelectChange = (e: { value: Product[] }) => {
    setSelectedProducts([...e.value]);
  };

  if (loading) return <div>Loading....</div>;
  if (error) return <div>Something went wrong...</div>;
  return (
    <>
      <div className="container">
        <DataTable
          value={products}
          selection={selectedProducts}
          onSelectionChange={handleSelectChange}
          dataKey="id"
          tableStyle={{
            minWidth: "50rem",
          }}
        >
          <Column
            selectionMode="multiple"
            headerStyle={{
              width: "5rem",
            }}
          ></Column>
          <Column field="title" header="Title"></Column>
          <Column field="place_of_origin" header="Origin"></Column>
          <Column field="artist_display" header="Artist"></Column>
          <Column field="inscription" header="Inscription"></Column>
          <Column field="date_start" header="Start Date"></Column>
          <Column field="date_end" header="End Date"></Column>
        </DataTable>
        <img
          src="/chevron-down.svg"
          className="custom-selector-img"
          onClick={(e: React.MouseEvent<HTMLImageElement>) =>
            op.current.toggle(e)
          }
        />
        <OverlayPanel ref={op}>
          <form className="selection-form" onSubmit={(e) => handleSubmit(e)}>
            <input
              type="number"
              placeholder="Select rows.."
              className="selection-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" className="selection-btn">
              Select
            </button>
          </form>
        </OverlayPanel>
      </div>
      <Paginator
        first={first}
        rows={rows}
        totalRecords={120}
        onPageChange={onPageChange}
      />
    </>
  );
}
