/*
 * Copyright (c) 2020-present SMC Treviso s.r.l. All rights reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { useState, useEffect } from "react";
import { createUseStyles } from "react-jss";
import { useRouter } from "next/router";
import useSWR from "swr";
import { format } from "date-fns";
import ClayForm, { ClayInput } from "@clayui/form";
import ClayList from "@clayui/list";

import {
  firstOrString,
  SearchResultsList,
  ThemeType,
} from "@openk9/search-ui-components";
import {
  doSearch,
  doSearchDatasource,
  GenericResultItem,
  getDataSourceInfo,
} from "@openk9/http-api";

import { DataSourceNavBar } from "../../../../../components/DataSourceNavBar";
import { Layout } from "../../../../../components/Layout";
import { useLoginCheck, useLoginInfo } from "../../../../../state";
import { red } from "ansicolor";
//const searchResults = [];
const dataListNew = [
  {
    name: "a1",
    description: "aniya99@gmail.com",
  },
  {
    name: "a2",
    description: "aniya99@gmail.com",
  },
  {
    name: "a3",
    description: "aniya99@gmail.com",
  },
  {
    name: "a4",
    description: "aniya99@gmail.com",
  },
];
const mystyle = {
  Color: "black !important",
  padding: "1px  !important",
  Width: "112px  !important",
  Height: "47px  !important",
};

const useStyles = createUseStyles((theme: ThemeType) => ({
  root: {
    margin: [theme.spacingUnit * 2, "auto"],
    backgroundColor: "white",
    boxShadow: theme.baseBoxShadow,
    width: "100%",
    maxWidth: 1000,
    borderRadius: theme.borderRadius,
    overflow: "auto",
    padding: theme.spacingUnit * 2,
  },
  settingHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultRow: {
    paddingBottom: "1em",
    paddingTop: "1em",
    "& + &": {
      borderTop: "1px solid black",
    },
  },
}));

function ResultRenderer({ res }: { res: GenericResultItem }) {
  const classes = useStyles();

  const { id, type, parsingDate, rawContent, ...rest } = res.source;

  return (
    <div className={classes.resultRow}>
      <div>
        <strong>Id:</strong> {id}
      </div>
      <div>
        <strong>Type:</strong> [{type.join(", ")}]
      </div>
      <div>
        <strong>ParsingDate:</strong> {format(parsingDate, "dd/MM/yyyy, HH:mm")}
      </div>
      {JSON.stringify(rest, null, 2)}
    </div>
  );
}

function Inner({
  tenantId,
  datasourceId,
}: {
  tenantId: number;
  datasourceId: number;
}) {
  const classes = useStyles();

  const loginInfo = useLoginInfo();

  const { data: datasource } = useSWR(
    `/api/v2/datasource/${datasourceId}`,
    () => getDataSourceInfo(datasourceId, loginInfo),
  );
  //finalData === datasource;


  const { data: searchResults } = useSWR(
    `/api/searcher/v1/search/${datasourceId}`,
    () =>
      doSearchDatasource(
        {
          searchQuery: [],
          range: [0, 20],
        },
        datasourceId,
        loginInfo,
      ),
  );
  console.log(searchResults);

  if (!searchResults) {
    return <span className="loading-animation" />;
  } 
  return (
    <>
      <div className={classes.settingHeader}>
        <h2>
          {datasource.datasourceId}: {datasource.name}
        </h2>
      </div>

      {!searchResults ? (
        <span className="loading-animation" />
      ) : (

        <span className="loading-animation" />
        /*searchResults.result.map((res) => (



          <ResultRenderer key={res.source.id} res={res} />


          
        ))*/
      )}

 
      <CreateDainamicListElement searchResults ={searchResults}/>
    </>
  );
  //export default searchResults;
}




function Draw({ list, record, setRecord, id }) {
  console.log("list" + list.source);
  console.log("record" + record.id);

  function toggle({ id, rawContent }) {
    alert(id + rawContent);
    let temp = record.id;
    if (temp === id) {
      setRecord({ id: "", rawContent: "" });
    } else {
      temp == id;
      console.log("id :" + id + "rawcontent :" + rawContent);
      setRecord({ id, rawContent });
    }

  }

  return (
    <div>
      <ClayList.Item flex value={list} onClick={() => toggle(list)}>
        <ClayList.ItemField> {list.source.rawContent} </ClayList.ItemField>
      </ClayList.Item>
      {list.source.contentId == record.id && (
        <div style={{ height: "300px", border: "2px solid gray" }}>
          <ClayInput
            id={list.name}
            placeholder="JSON"
            type="text"
            disabled={true}
          ></ClayInput>
          <span>{list.source.rawContent }</span>
        </div>
      )}
    </div>
  );
}

//);

function DSDataBrowser() {

  

  const classes = useStyles();
  const [result, setResult] = useState(null);
  const { query } = useRouter();
  
  const datasourceId = query.datasourceId && firstOrString(query.datasourceId);
  const dataSourceInt = parseInt(datasourceId || "NaN");
  const [identifier, setIdentifier] = useState(dataSourceInt);
  
 
  
  const tenantId = query.tenantId && firstOrString(query.tenantId);

  const { loginValid } = useLoginCheck();
  if (!loginValid) return <span className="loading-animation" />;

  if (isNaN(dataSourceInt) || !tenantId || !datasourceId) {
    return null;
  }

  
  return (
    <>
      <Layout
        breadcrumbsPath={[
          { label: "Tenants", path: "/tenants" },
          { label: tenantId },
          { label: "DataSources", path: `/tenants/${tenantId}/dataSources` },
          { label: datasourceId },
          {
            label: "DataBrowser",
            path: `/tenants/${tenantId}/dataSources/dataBrowser`,
          },
        ]}
        breadcrumbsControls={
          <DataSourceNavBar
            tenantId={parseInt(tenantId)}
            datasourceId={dataSourceInt}
          />
        }
      >
        <div className={classes.root}>
          <Inner tenantId={parseInt(tenantId)} datasourceId={dataSourceInt} />
          
        </div>
        <div></div>
      </Layout>
    </>
  );
}

export default DSDataBrowser;


function CreateDainamicListElement ({searchResults}){

  const [dataList, setDatalist] = useState([]);
  const [record, setRecord] = useState({ id:"", rawContent: ""});
//console.log(">>>>> " +  JSON.stringify(searchResults))

useEffect(()=> {
setDatalist(searchResults.result)
},[searchResults])
  return(
    <>
    <ClayForm.Group>
      <label htmlFor="basicInputText">Search Input</label>
      <ClayInput
        id="basicInputText"
        placeholder="Insert your keyword"
        type="text"
      />
    </ClayForm.Group>
  
  
    <ClayList>
      <ClayList.Header>
        <span> List Of Indexed Document Total N0: 12000 </span>
      </ClayList.Header>

      {dataList && dataList?.map((list, index) => (
        <Draw
          key={index}
          list={list}
          record={record}
          setRecord={setRecord}
          id = {list.source.contentId}
        />
      ))}
    </ClayList>
    </>
  )

}