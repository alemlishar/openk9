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

import { apiBaseUrl } from "./common";

export interface SearchKeyword {
  keyword: string;
  fieldBoost: { [key: string]: number };
}

export type DocumentType = {
  name: string;
  icon: string;
  searchKeywords: SearchKeyword[];
};

export type SupportedDataSource = {
  name: string;
  active: boolean;
  documentTypes: DocumentType[];
  defaultDocumentType: DocumentType;
};

export async function getSupportedDataSources(): Promise<
  SupportedDataSource[]
> {
  const request = await fetch(`${apiBaseUrl}/supported-datasources`);
  const response: SupportedDataSource[] = await request.json();
  return response;
}