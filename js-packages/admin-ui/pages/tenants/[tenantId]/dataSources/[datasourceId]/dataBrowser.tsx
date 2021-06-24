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

import React from "react";
import { createUseStyles } from "react-jss";
import { useRouter } from "next/router";
import useSWR from "swr";
import { format } from "date-fns";
import ClayForm, { ClayInput } from "@clayui/form";
import ClayList from "@clayui/list";

import { firstOrString, ThemeType } from "@openk9/search-ui-components";
import {
  doSearch,
  GenericResultItem,
  getDataSourceInfo,
} from "@openk9/http-api";

import { DataSourceNavBar } from "../../../../../components/DataSourceNavBar";
import { Layout } from "../../../../../components/Layout";
import { useLoginCheck, useLoginInfo } from "../../../../../state";

const mystyle = {
  Color: "black",
  padding: "1px",
  innerWidth: "112px",
  innerHeight: "47px",
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

  console.log("getted result of Datasource :" + datasource?.jsonConfig);
  const { data: searchResults } = useSWR(``, () =>
    doSearch(
      {
        searchQuery: [{ tokenType: "TEXT", values: ["regione.toscana.it"] }],
        range: [0, 20],
      },
      loginInfo,
    ),
  );
  console.log("getted result Datasource Search:" + datasource);

  if (!datasource) {
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

function DSDataBrowser() {
  const classes = useStyles();

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
                <span>
                  {" "}
                  List Of Indexed
                  Document&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Total N0:
                  &nbsp;&nbsp; 12000{" "}
                </span>
              </ClayList.Header>

              <ClayList.Item flex>
                <ClayList.ItemField> Document 1</ClayList.ItemField>
              </ClayList.Item>

              <ClayList.Item flex>
                <div style={mystyle}>
                  {true == true ? (
                    <span style={mystyle}>
                      {" "}
                      <h1>Json Data</h1>{" "} 
                    </span>
                  ) : null}
                </div>
              </ClayList.Item>
            </ClayList>
          }
        </div>
        <div></div>
      </Layout>
    </>
  );
}

export default DSDataBrowser;
