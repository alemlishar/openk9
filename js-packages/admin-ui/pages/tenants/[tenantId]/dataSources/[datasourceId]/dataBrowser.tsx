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

import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import { useRouter } from "next/router";
import useSWR from "swr";
import { format } from "date-fns";
import ClayForm, { ClayInput } from "@clayui/form";
import ClayList from "@clayui/list";

import { firstOrString, ThemeType } from "@openk9/search-ui-components";
import {
  doSearch,
  doSearchDatasource,
  GenericResultItem,
  getDataSourceInfo,
} from "@openk9/http-api";

import { DataSourceNavBar } from "../../../../../components/DataSourceNavBar";
import { Layout } from "../../../../../components/Layout";
import { useLoginCheck, useLoginInfo } from "../../../../../state";
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

  const { data: finalData } = useSWR(`/api/v2/datasource/${datasourceId}`, () =>
    getDataSourceInfo(datasourceId, loginInfo),
  );
  //finalData === datasource;

  console.log("getted result of Datasource finalData:" + finalData?.jsonConfig);

  const { data: searchResults } = useSWR(``, () =>
    doSearchDatasource(
      {
        searchQuery: [{ tokenType: "TEXT", values: ["regione.toscana.it"] }],
        range: [0, 20],
      },
      datasourceId,
      loginInfo,
    ),
  );

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
        searchResults.result.map((res) => (
          <ResultRenderer key={res.source.id} res={res} />
        ))
      )}
    </>
  );
}

function Draw({ list, record, setRecord }) {
  function toggle({ name, description }) {
    let temp = record.name;
    if (temp === name) {
      setRecord({ name: "", description: "" });
    } else {
      temp == name;
      setRecord({ name, description });
    }

    console.log(record.name + description);
  }

  return (
    <div>
      <ClayList.Item flex value={list} onClick={() => toggle(list)}>
        <ClayList.ItemField> {list.name} </ClayList.ItemField>
      </ClayList.Item>
      {list.name == record.name && (
        <div>
          <span>{list.description}</span>
        </div>
      )}
    </div>
  );
}

function DSDataBrowser() {
  const classes = useStyles();
  const [dataList, setDatalist] = useState(dataListNew);
  const [record, setRecord] = useState({ name: "", description: "" });

  const [showDescriptionIdentifier, setshowSelectedIdentifier] = useState(null);

  const { query } = useRouter();
  const tenantId = query.tenantId && firstOrString(query.tenantId);
  const datasourceId = query.datasourceId && firstOrString(query.datasourceId);
  const dataSourceInt = parseInt(datasourceId || "NaN");

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
          {
            <ClayForm.Group>
              <label htmlFor="basicInputText">Search Input</label>
              <ClayInput
                id="basicInputText"
                placeholder="Insert your keyword"
                type="text"
              />
            </ClayForm.Group>
          }
          {
            <ClayList>
              <ClayList.Header>
                <span> List Of Indexed Document Total N0: 12000 </span>
              </ClayList.Header>

              {dataList.map((list, index) => (
                <Draw
                  key={index}
                  list={list}
                  record={record}
                  setRecord={setRecord}
                />
              ))}
            </ClayList>
          }
        </div>
        <div></div>
      </Layout>
    </>
  );
}

export default DSDataBrowser;
