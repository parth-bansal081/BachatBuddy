import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Category } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Transaction, formatCurrency, formatDate, categoryBgLight } from "@/lib/data";

import { Pencil, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface TransactionTableProps {
  transactions: Transaction[];
  showAll?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (transaction: Transaction) => void;
  currencyCode?: string;
}

export function TransactionTable({ transactions, showAll = false, onDelete, onEdit, currencyCode }: TransactionTableProps) {
  const displayTransactions = showAll ? transactions : transactions.slice(0, 5);

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Date</TableHead>
              <TableHead className="text-muted-foreground font-medium">Merchant</TableHead>
              <TableHead className="text-muted-foreground font-medium">Category</TableHead>
              <TableHead className="text-right text-muted-foreground font-medium">Amount</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayTransactions.map((transaction, index) => (
              <TableRow
                key={transaction.id}
                className="animate-fade-in group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(transaction.date)}
                </TableCell>
                <TableCell className="font-medium">{transaction.merchant}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`${categoryBgLight[transaction.category]} border font-medium`}
                  >
                    {transaction.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(transaction.amount, currencyCode)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit?.(transaction)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete?.(transaction.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
