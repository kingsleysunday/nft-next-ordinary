import {
  Box,
  BoxProps,
  Center,
  Code,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Portal,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useImageFileOrUrl } from "hooks/useImageFileOrUrl";
import { useMemo } from "react";
import {
  MdFirstPage,
  MdLastPage,
  MdNavigateBefore,
  MdNavigateNext,
} from "react-icons/md";
import { Column, usePagination, useTable } from "react-table";

const FileImage = ({ src, ...props }) => {
  const img = useImageFileOrUrl(src);
  return <Image {...props} src={img} />;
};

const FileVideo = ({ src, ...props }) => {
  const video = useImageFileOrUrl(src);
  return <Box as="video" {...props} src={video} />;
};

export const BatchTable = ({ data, portalRef }) => {
  const columns = useMemo(() => {
    return [
      {
        Header: "Token ID",
        accessor: (_row, index) => index,
      },
      {
        Header: "Image",
        accessor: (row) => row.image,
        Cell: ({ cell: { value } }) =>
          // We do this so users can see a preview of their IPFS hashes when batch uploading
          typeof value === "string" && value.startsWith("ipfs://") ? (
            <FileImage
              flexShrink={0}
              boxSize={24}
              objectFit="contain"
              src={value.replace(
                "ipfs://",
                `${process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL}/` || "",
              )}
              alt=""
            />
          ) : value ? (
            <FileImage
              flexShrink={0}
              boxSize={24}
              objectFit="contain"
              src={value}
              alt=""
            />
          ) : null,
      },
      {
        Header: "Animation Url",
        accessor: (row) => row.animation_url,
        Cell: ({ cell: { value } }) =>
          // We do this so users can see a preview of their IPFS hashes when batch uploading
          typeof value === "string" && value.startsWith("ipfs://") ? (
            <FileVideo
              flexShrink={0}
              boxSize={24}
              objectFit="contain"
              src={value.replace(
                "ipfs://",
                `${process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL}/` || "",
              )}
              autoPlay
              playsInline
              muted
              loop
            />
          ) : value ? (
            <FileVideo
              flexShrink={0}
              boxSize={24}
              objectFit="contain"
              src={value}
              autoPlay
              playsInline
              muted
              loop
            />
          ) : null,
      },
      { Header: "Name", accessor: (row) => row.name },
      {
        Header: "Description",
        accessor: (row) => row.description,
      },
      {
        Header: "Properties",
        accessor: (row) => row.properties,
        Cell: ({ cell }) => (
          <Code whiteSpace="pre">{JSON.stringify(cell.value, null, 2)}</Code>
        ),
      },
      { Header: "External URL", accessor: (row) => row.external_url },
      { Header: "Background Color", accessor: (row) => row.background_color },
    ];
  }, []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    // Instead of using 'rows', we'll use page,
    page,
    // which has only the rows for the active page

    // The rest of these things are super handy, too ;)
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: {
        pageSize: 50,
        pageIndex: 0,
      },
    },
    usePagination,
  );

  // Render the UI for your table
  return (
    <Flex flexGrow={1} overflow="auto">
      <Box w="100%">
        <Table {...getTableProps()}>
          <Thead>
            {headerGroups.map((headerGroup) => (
              // eslint-disable-next-line react/jsx-key
              <Tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  // eslint-disable-next-line react/jsx-key
                  <Th {...column.getHeaderProps()}>
                    {column.render("Header")}
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              return (
                // eslint-disable-next-line react/jsx-key
                <Tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      // eslint-disable-next-line react/jsx-key
                      <Td {...cell.getCellProps()}>{cell.render("Cell")}</Td>
                    );
                  })}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>

      <Portal containerRef={portalRef}>
        <Center w="100%">
          <HStack>
            <IconButton
              isDisabled={!canPreviousPage}
              aria-label="first page"
              icon={<Icon as={MdFirstPage} />}
              onClick={() => gotoPage(0)}
            />
            <IconButton
              isDisabled={!canPreviousPage}
              aria-label="previous page"
              icon={<Icon as={MdNavigateBefore} />}
              onClick={() => previousPage()}
            />
            <Text whiteSpace="nowrap">
              Page <strong>{pageIndex + 1}</strong> of{" "}
              <strong>{pageOptions.length}</strong>
            </Text>
            <IconButton
              isDisabled={!canNextPage}
              aria-label="next page"
              icon={<Icon as={MdNavigateNext} />}
              onClick={() => nextPage()}
            />
            <IconButton
              isDisabled={!canNextPage}
              aria-label="last page"
              icon={<Icon as={MdLastPage} />}
              onClick={() => gotoPage(pageCount - 1)}
            />

            <Select
              onChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
              }}
              value={pageSize}
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="250">250</option>
              <option value="500">500</option>
            </Select>
          </HStack>
        </Center>
      </Portal>
    </Flex>
  );
};
